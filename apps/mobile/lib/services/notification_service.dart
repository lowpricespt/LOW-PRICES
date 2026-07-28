/// Contrato do serviço de notificações push. A implementação real usa
/// `firebase_messaging`, mas esse pacote exige ficheiros de configuração
/// nativos (`google-services.json` no Android, `GoogleService-Info.plist`
/// no iOS) gerados a partir do teu projeto Firebase — sem isso o build
/// falha. Por segurança, não adicionei o pacote ainda; esta interface
/// existe para que o resto da app (ex.: ecrã de Notificações) já possa
/// ser escrito contra o contrato final.
///
/// Para ativar: 1) cria o projeto no Firebase Console, 2) corre
/// `flutterfire configure`, 3) adiciona `firebase_messaging` ao
/// pubspec.yaml, 4) implementa `FirebaseNotificationService`.
abstract class NotificationService {
  Future<void> requestPermission();
  Future<String?> getDeviceToken();
  Stream<Map<String, dynamic>> get onMessageReceived;
}

class StubNotificationService implements NotificationService {
  @override
  Future<void> requestPermission() async {}

  @override
  Future<String?> getDeviceToken() async => null;

  @override
  Stream<Map<String, dynamic>> get onMessageReceived => const Stream.empty();
}
