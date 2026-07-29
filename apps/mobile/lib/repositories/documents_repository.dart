import '../core/utils/result.dart';
import '../services/api_service.dart';

enum ProfessionalDocumentType {
  identity('IDENTITY'),
  proofOfActivity('PROOF_OF_ACTIVITY'),
  certificate('CERTIFICATE');

  const ProfessionalDocumentType(this.value);

  final String value;
}

/// Espelha `DocumentsController` — guarda sempre o `key` do upload
/// (`POST /storage/upload`), nunca a `url` assinada (essa expira).
class DocumentsRepository {
  DocumentsRepository(this._apiService);

  final ApiService _apiService;

  Future<Result<void>> upsert({required ProfessionalDocumentType type, required String key}) {
    return _apiService.guard(
      () => _apiService.dio.post('/documents', data: {'type': type.value, 'key': key}),
    );
  }
}
