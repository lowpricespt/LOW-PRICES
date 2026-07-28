enum AppPermission { camera, location, photos, notifications }

enum AppPermissionStatus { granted, denied, permanentlyDenied }

/// Contrato do serviço de permissões. A implementação real usa
/// `permission_handler`, mas cada permissão pedida tem de estar
/// declarada no `AndroidManifest.xml`/`Info.plist` — decide-se isso
/// junto com o passo do wizard que a usa (ex.: câmara no Passo 3 de
/// Fotos), para não pedir acesso a nada que a app ainda não usa.
abstract class PermissionService {
  Future<AppPermissionStatus> request(AppPermission permission);
  Future<AppPermissionStatus> check(AppPermission permission);
}

class StubPermissionService implements PermissionService {
  @override
  Future<AppPermissionStatus> request(AppPermission permission) async => AppPermissionStatus.denied;

  @override
  Future<AppPermissionStatus> check(AppPermission permission) async => AppPermissionStatus.denied;
}
