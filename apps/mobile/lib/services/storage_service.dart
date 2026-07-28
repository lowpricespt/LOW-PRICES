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

  Future<void> clearSession() => Future.wait([
        _storage.delete(key: _accessTokenKey),
        _storage.delete(key: _refreshTokenKey),
      ]);
}
