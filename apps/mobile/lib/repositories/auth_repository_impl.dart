import '../core/errors/failure.dart';
import '../core/utils/result.dart';
import '../services/api_service.dart';
import '../services/storage_service.dart';
import 'auth_repository.dart';

class AuthRepositoryImpl implements AuthRepository {
  AuthRepositoryImpl(this._apiService, this._storageService);

  final ApiService _apiService;
  final StorageService _storageService;

  @override
  Future<Result<void>> login({required String email, required String password}) async {
    final result = await _apiService.guard(
      () => _apiService.dio.post<Map<String, dynamic>>(
        '/auth/login',
        data: {'email': email, 'password': password},
      ),
    );

    return switch (result) {
      Ok(:final value) => await _persistTokensFrom(value.data!),
      Err(:final failure) => Err(failure),
    };
  }

  @override
  Future<Result<void>> register({
    required String name,
    required String email,
    required String password,
  }) async {
    final result = await _apiService.guard(
      () => _apiService.dio.post<Map<String, dynamic>>(
        '/auth/register',
        data: {'name': name, 'email': email, 'password': password, 'role': 'CLIENT'},
      ),
    );

    return switch (result) {
      Ok(:final value) => await _persistTokensFrom(value.data!),
      Err(:final failure) => Err(failure),
    };
  }

  @override
  Future<void> logout() async {
    await _apiService.guard(() => _apiService.dio.post('/auth/logout'));
    await _storageService.clearSession();
  }

  @override
  Future<bool> hasActiveSession() async {
    final token = await _storageService.getRefreshToken();
    return token != null;
  }

  Future<Result<void>> _persistTokensFrom(Map<String, dynamic> data) async {
    final accessToken = data['accessToken'] as String?;
    final refreshToken = data['refreshToken'] as String?;

    if (accessToken == null || refreshToken == null) {
      return const Err(UnknownFailure('Resposta inesperada do servidor.'));
    }

    await _storageService.setAccessToken(accessToken);
    await _storageService.setRefreshToken(refreshToken);
    return const Ok(null);
  }
}
