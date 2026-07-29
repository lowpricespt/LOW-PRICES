import 'dart:io';
import 'package:dio/dio.dart';
import '../core/utils/result.dart';
import '../services/api_service.dart';

class UploadedFile {
  const UploadedFile({required this.key, required this.url});

  final String key;
  final String url;
}

/// Pastas aceites por `StorageController` no backend — mantidas em sincronia
/// manual com `VALID_FOLDERS` em `apps/api/src/infra/storage/storage.controller.ts`.
enum UploadFolder {
  avatars,
  documents,
  requestPhotos('request-photos');

  const UploadFolder([this._override]);

  final String? _override;

  String get value => _override ?? name;
}

class StorageRepository {
  StorageRepository(this._apiService);

  final ApiService _apiService;

  Future<Result<UploadedFile>> uploadFile({required File file, required UploadFolder folder}) {
    return _apiService.guard(() async {
      final formData = FormData.fromMap({
        'file': await MultipartFile.fromFile(file.path, filename: file.path.split(Platform.pathSeparator).last),
      });
      final response = await _apiService.dio.post<Map<String, dynamic>>(
        '/storage/upload',
        data: formData,
        queryParameters: {'folder': folder.value},
      );
      final data = response.data!;
      return UploadedFile(key: data['key'] as String, url: data['url'] as String);
    });
  }
}
