/// Configuração de ambiente da app. Os valores vêm de `--dart-define` no
/// momento do build (nunca hardcoded), à semelhança do `.env` do website.
///
/// Exemplo:
/// ```
/// flutter run --dart-define=API_BASE_URL=http://localhost:3000
/// ```
class Env {
  Env._();

  /// Em Android o emulador usa `10.0.2.2` como alias do localhost da
  /// máquina anfitriã; em iOS Simulator e desktop, `localhost` funciona
  /// diretamente. Por omissão assume-se o cenário mais comum (emulador
  /// Android), e substitui-se via `--dart-define` nos outros casos.
  static const apiBaseUrl = String.fromEnvironment(
    'API_BASE_URL',
    defaultValue: 'http://10.0.2.2:3000',
  );

  static const googleMapsApiKey = String.fromEnvironment('GOOGLE_MAPS_API_KEY');

  static const isProduction = bool.fromEnvironment('dart.vm.product');
}
