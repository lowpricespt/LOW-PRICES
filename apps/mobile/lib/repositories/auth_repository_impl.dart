import 'package:google_sign_in/google_sign_in.dart';
import '../core/config/env.dart';
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
    String role = 'CLIENT',
  }) async {
    final result = await _apiService.guard(
      () => _apiService.dio.post<Map<String, dynamic>>(
        '/auth/register',
        data: {'name': name, 'email': email, 'password': password, 'role': role},
      ),
    );

    return switch (result) {
      Ok(:final value) => await _persistTokensFrom(value.data!),
      Err(:final failure) => Err(failure),
    };
  }

  /// Espelha o fluxo `/auth/google` (redirecionamento) do website, mas
  /// por token nativo — uma app não tem página inteira nem cookie
  /// partilhado com o browser. Ver `AuthService.verifyGoogleIdToken` no
  /// backend para o porquê de `serverClientId` ter de ser o MESMO
  /// `GOOGLE_CLIENT_ID` (tipo "Web application") já usado lá.
  @override
  Future<Result<GoogleLoginOutcome?>> loginWithGoogle({String role = 'CLIENT'}) async {
    if (Env.googleServerClientId.isEmpty) {
      return const Err(UnknownFailure('Login com Google ainda não está configurado nesta app.'));
    }

    final googleSignIn = GoogleSignIn(serverClientId: Env.googleServerClientId, scopes: const ['email']);
    GoogleSignInAccount? account;
    try {
      account = await googleSignIn.signIn();
    } catch (_) {
      return const Err(UnknownFailure('Não foi possível abrir o ecrã de login do Google.'));
    }
    // `null` = o utilizador fechou o seletor de conta sem escolher
    // nenhuma — cancelamento normal, não um erro a mostrar.
    if (account == null) return const Ok(null);

    final auth = await account.authentication;
    final idToken = auth.idToken;
    if (idToken == null) {
      return const Err(UnknownFailure('O Google não devolveu um token válido. Tenta novamente.'));
    }

    final result = await _apiService.guard(
      () => _apiService.dio.post<Map<String, dynamic>>(
        '/auth/google/mobile',
        data: {'idToken': idToken, 'role': role},
      ),
    );

    return switch (result) {
      Ok(:final value) => await _persistGoogleTokensFrom(value.data!),
      Err(:final failure) => Err(failure),
    };
  }

  @override
  Future<void> logout() async {
    await _apiService.guard(() => _apiService.dio.post('/auth/logout'));
    await _storageService.clearSession();
  }

  @override
  Future<Result<void>> changePassword({required String currentPassword, required String newPassword}) {
    return _apiService.guard(
      () => _apiService.dio.patch(
        '/auth/change-password',
        data: {'currentPassword': currentPassword, 'newPassword': newPassword},
      ),
    );
  }

  @override
  Future<Result<void>> requestEmailChange({required String newEmail, required String currentPassword}) {
    return _apiService.guard(
      () => _apiService.dio.post(
        '/auth/change-email',
        data: {'newEmail': newEmail, 'currentPassword': currentPassword},
      ),
    );
  }

  @override
  Future<Result<void>> deleteAccount() {
    return _apiService.guard(() => _apiService.dio.delete('/users/me'));
  }

  @override
  Future<bool> hasActiveSession() async {
    final token = await _storageService.getRefreshToken();
    return token != null;
  }

  @override
  Future<String?> currentRole() => _storageService.getRole();

  Future<Result<void>> _persistTokensFrom(Map<String, dynamic> data) async {
    final accessToken = data['accessToken'] as String?;
    final refreshToken = data['refreshToken'] as String?;
    final role = (data['user'] as Map<String, dynamic>?)?['role'] as String?;

    if (accessToken == null || refreshToken == null) {
      return const Err(UnknownFailure('Resposta inesperada do servidor.'));
    }

    await _storageService.setAccessToken(accessToken);
    await _storageService.setRefreshToken(refreshToken);
    await _storageService.setRole(role);
    return const Ok(null);
  }

  Future<Result<GoogleLoginOutcome?>> _persistGoogleTokensFrom(Map<String, dynamic> data) async {
    final accessToken = data['accessToken'] as String?;
    final refreshToken = data['refreshToken'] as String?;
    final user = data['user'] as Map<String, dynamic>?;
    final role = user?['role'] as String?;

    if (accessToken == null || refreshToken == null || role == null) {
      return const Err(UnknownFailure('Resposta inesperada do servidor.'));
    }

    await _storageService.setAccessToken(accessToken);
    await _storageService.setRefreshToken(refreshToken);
    await _storageService.setRole(role);

    return Ok(GoogleLoginOutcome(
      role: role,
      requiresCategorySelection: data['requiresCategorySelection'] as bool? ?? false,
    ));
  }
}
