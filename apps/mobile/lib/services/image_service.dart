import 'package:image_picker/image_picker.dart';

/// Seleção de imagens (câmara/galeria). O upload em si (para o Cloudflare
/// R2, via `POST /storage/upload`) é responsabilidade de
/// `StorageRepository` — mantém a escolha do ficheiro (preocupação do
/// dispositivo) separada do envio (preocupação de rede).
abstract class ImageService {
  Future<String?> pickFromGallery();
  Future<String?> pickFromCamera();
}

class ImageServiceImpl implements ImageService {
  final _picker = ImagePicker();

  @override
  Future<String?> pickFromGallery() async {
    final file = await _picker.pickImage(source: ImageSource.gallery, imageQuality: 85);
    return file?.path;
  }

  @override
  Future<String?> pickFromCamera() async {
    final file = await _picker.pickImage(source: ImageSource.camera, imageQuality: 85);
    return file?.path;
  }
}

class StubImageService implements ImageService {
  @override
  Future<String?> pickFromGallery() async => null;

  @override
  Future<String?> pickFromCamera() async => null;
}
