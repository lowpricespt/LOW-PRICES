import 'package:dio/dio.dart';
import '../core/config/env.dart';
import '../core/errors/failure.dart';
import '../core/utils/result.dart';
import 'storage_service.dart';

/// Cliente HTTP único da aplicação. Toda a comunicação com o backend
/// NestJS passa por aqui — nenhuma feature deve instanciar o seu próprio
/// Dio. Injeta automaticamente o access token, renova a sessão
/// automaticamente em 401, tenta novamente pedidos que falhem por erro
/// de rede, e expõe `guard()` para qualquer repository converter uma
/// chamada Dio em `Result<T>`.
class ApiService {
  ApiService(this._storageService)
      : dio = Dio(
          BaseOptions(
            baseUrl: Env.apiBaseUrl,
            connectTimeout: const Duration(seconds: 15),
            receiveTimeout: const Duration(seconds: 15),
            headers: {'Content-Type': 'application/json'},
          ),
        ) {
    dio.interceptors.add(
      InterceptorsWrapper(
        onRequest: (options, handler) async {
          final token = await _storageService.getAccessToken();
          if (token != null) {
            options.headers['Authorization'] = 'Bearer $token';
          }
          handler.next(options);
        },
        onError: (error, handler) async {
          final isUnauthorized = error.response?.statusCode == 401;
          final isRefreshCall = error.requestOptions.path.contains('/auth/refresh');
          final alreadyRetried = error.requestOptions.extra['retried'] == true;

          if (!isUnauthorized || isRefreshCall || alreadyRetried) {
            handler.next(error);
            return;
          }

          try {
            await _refreshAccessTokenSingleFlight();
            final retryOptions = error.requestOptions;
            retryOptions.extra['retried'] = true;
            final token = await _storageService.getAccessToken();
            retryOptions.headers['Authorization'] = 'Bearer $token';
            final response = await dio.fetch(retryOptions);
            handler.resolve(response);
          } catch (_) {
            await _storageService.clearSession();
            handler.next(error);
          }
        },
      ),
    );
  }

  final Dio dio;
  final StorageService _storageService;

  static const _maxRetries = 2;

  // Vários pedidos podem falhar com 401 quase ao mesmo tempo (ex.: a app
  // volta do segundo plano e dispara logo várias chamadas em paralelo).
  // Sem coordenação, cada um dispararia o seu próprio `refreshAccessToken`
  // com o MESMO refresh token ainda guardado — o backend roda o token a
  // cada renovação, por isso o segundo pedido chegaria com um token já
  // substituído pelo primeiro. Fora da janela de tolerância a rotações
  // concorrentes (`REUSE_GRACE_PERIOD_MS` no backend), isto é tratado como
  // reutilização de token roubado e revoga a sessão inteira — um logout
  // inesperado sem o utilizador ter feito nada de errado. Mesmo dentro da
  // janela, escritas concorrentes em `_storageService` podiam gravar um
  // refresh token que já não correspondia ao que ficou ativo no servidor.
  // Partilhar a mesma renovação em curso entre todos os pedidos concorrentes
  // (mesmo padrão do `isRefreshing`/fila em `services/api/axios.ts` do
  // website) elimina a corrida na origem, em vez de depender só da
  // tolerância do lado do servidor.
  Future<void>? _refreshInFlight;

  Future<void> _refreshAccessTokenSingleFlight() {
    return _refreshInFlight ??= refreshAccessToken().whenComplete(() {
      _refreshInFlight = null;
    });
  }

  /// Troca o refresh token guardado por um novo par de tokens. Chamado
  /// automaticamente pelo interceptor acima quando um pedido devolve
  /// 401 — mesmo contrato do `refreshAccessToken()` em
  /// `services/api/auth-session.ts` do website.
  Future<void> refreshAccessToken() async {
    final refreshToken = await _storageService.getRefreshToken();
    if (refreshToken == null) {
      throw const UnauthorizedFailure('Sem sessão para renovar.');
    }

    final response = await dio.post<Map<String, dynamic>>(
      '/auth/refresh',
      data: {'refreshToken': refreshToken},
    );

    final data = response.data!;
    await _storageService.setAccessToken(data['accessToken'] as String);
    await _storageService.setRefreshToken(data['refreshToken'] as String);
  }

  /// Executa um pedido Dio e devolve sempre um `Result<T>` — nunca deixa
  /// uma `DioException` escapar para o repository. Faz retry automático
  /// (até [_maxRetries]) só em falhas de rede (timeout/sem ligação),
  /// nunca em erros de validação ou do servidor, onde repetir não ajuda.
  Future<Result<T>> guard<T>(Future<T> Function() request) async {
    var attempt = 0;
    while (true) {
      try {
        final value = await request();
        return Ok(value);
      } on DioException catch (error) {
        final isNetworkError = error.type == DioExceptionType.connectionTimeout ||
            error.type == DioExceptionType.connectionError ||
            error.type == DioExceptionType.receiveTimeout;

        if (isNetworkError && attempt < _maxRetries) {
          attempt++;
          await Future.delayed(Duration(milliseconds: 300 * attempt));
          continue;
        }

        return Err(_mapDioError(error));
      } catch (_) {
        return const Err(UnknownFailure());
      }
    }
  }

  Failure _mapDioError(DioException error) {
    final response = error.response;
    if (response == null) {
      return const NetworkFailure();
    }

    if (response.statusCode == 401) {
      return const UnauthorizedFailure();
    }

    final data = response.data;
    final backendMessage = data is Map<String, dynamic> ? data['message'] : null;

    if (response.statusCode == 400 && backendMessage is List) {
      return ValidationFailure(backendMessage.join(', '));
    }

    final message = backendMessage is String ? backendMessage : 'Ocorreu um erro inesperado.';
    return ServerFailure(message, statusCode: response.statusCode);
  }
}
