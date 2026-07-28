/// Contrato do serviço de localização/mapas. A implementação real usa
/// `google_maps_flutter` + `geolocator`, mas exige a tua chave de API do
/// Google Maps Platform configurada nativamente (AndroidManifest.xml e
/// AppDelegate.swift) — sem isso o build falha. Não adicionei os pacotes
/// ainda; esta interface existe para os ecrãs de localização (Passo 4 do
/// wizard do cliente, Passo 4 do onboarding de profissional) já poderem
/// ser escritos contra o contrato final.
abstract class MapsService {
  Future<({double latitude, double longitude})?> getCurrentLocation();
  Future<String?> reverseGeocode({required double latitude, required double longitude});
}

class StubMapsService implements MapsService {
  @override
  Future<({double latitude, double longitude})?> getCurrentLocation() async => null;

  @override
  Future<String?> reverseGeocode({required double latitude, required double longitude}) async => null;
}
