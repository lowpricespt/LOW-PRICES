import 'package:flutter_secure_storage/flutter_secure_storage.dart';

/// Acesso ao keychain/keystore nativo. Equivalente ao
/// `services/api/auth-session.ts` do website, mas com armazenamento
/// persistente e seguro (o do website vive em memória, porque um browser
/// já tem cookies httpOnly para o refresh token; no mobile não há esse
/// mecanismo, por isso usamos o secure storage nativo).
class StorageService {
  StorageService({FlutterSecureStorage? storage}) : _storage = storage ?? const FlutterSecureStorage();

  final FlutterSecureStorage _storage;

  static const _accessTokenKey = 'low_prices_access_token';
  static const _refreshTokenKey = 'low_prices_refresh_token';
  static const _roleKey = 'low_prices_role';

  Future<String?> getAccessToken() => _storage.read(key: _accessTokenKey);

  Future<void> setAccessToken(String? token) {
    if (token == null) return _storage.delete(key: _accessTokenKey);
    return _storage.write(key: _accessTokenKey, value: token);
  }

  Future<String?> getRefreshToken() => _storage.read(key: _refreshTokenKey);

  Future<void> setRefreshToken(String? token) {
    if (token == null) return _storage.delete(key: _refreshTokenKey);
    return _storage.write(key: _refreshTokenKey, value: token);
  }

  /// 'CLIENT' | 'PROFESSIONAL' | 'ADMIN' — guardado a partir da resposta de
  /// login/registo, só para decidir para que dashboard navegar no arranque
  /// da app sem precisar de um pedido extra a `GET /users/me`. Nunca usado
  /// para autorização — isso é sempre decidido pelo backend a partir do
  /// JWT.
  Future<String?> getRole() => _storage.read(key: _roleKey);

  Future<void> setRole(String? role) {
    if (role == null) return _storage.delete(key: _roleKey);
    return _storage.write(key: _roleKey, value: role);
  }

  Future<void> clearSession() => Future.wait([
        _storage.delete(key: _accessTokenKey),
        _storage.delete(key: _refreshTokenKey),
        _storage.delete(key: _roleKey),
      ]);
}
