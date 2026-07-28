/// Contrato do serviço de imagens (seleção + upload). A implementação
/// real usa `image_picker` (câmara/galeria) e faz upload para o
/// Cloudflare R2 através do `ApiService` — usados no Passo 3 (Fotos) do
/// wizard do cliente e no Passo 5 (Foto) do onboarding de profissional.
/// Não adicionei o pacote nativo ainda para manter este bloco focado na
/// fundação; entra junto com esses passos do wizard.
abstract class ImageService {
  Future<String?> pickFromGallery();
  Future<String?> pickFromCamera();
  Future<String?> uploadImage(String localPath);
}

class StubImageService implements ImageService {
  @override
  Future<String?> pickFromGallery() async => null;

  @override
  Future<String?> pickFromCamera() async => null;

  @override
  Future<String?> uploadImage(String localPath) async => null;
}
