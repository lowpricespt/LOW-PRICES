/// Configuração de ambiente da app. Os valores vêm de `--dart-define` no
/// momento do build (nunca hardcoded), à semelhança do `.env` do website.
///
/// Exemplo:
/// ```
/// flutter run --dart-define=API_BASE_URL=http://localhost:3000
/// ```
class Env {
  Env._();

  static const isProduction = bool.fromEnvironment('dart.vm.product');

  /// Vazio quando ninguém passou `--dart-define=API_BASE_URL=...` no build.
  static const _apiBaseUrlOverride = String.fromEnvironment('API_BASE_URL');

  /// Em Android o emulador usa `10.0.2.2` como alias do localhost da
  /// máquina anfitriã; em iOS Simulator e desktop, `localhost` funciona
  /// diretamente. Sem override explícito, um build de release (`flutter
  /// build ... --release`, o que a Play Store/TestFlight recebem) tem de
  /// apontar para a API real, nunca para localhost — caso contrário a app
  /// publicada fica muda em produção sem ninguém reparar.
  static const apiBaseUrl = _apiBaseUrlOverride == ''
      ? (isProduction ? 'https://low-pricesapi-production.up.railway.app' : 'http://10.0.2.2:3000')
      : _apiBaseUrlOverride;

  static const googleMapsApiKey = String.fromEnvironment('GOOGLE_MAPS_API_KEY');
}
