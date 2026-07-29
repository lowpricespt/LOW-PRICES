import '../core/utils/result.dart';
import '../services/api_service.dart';

/// Atualizações ao perfil de profissional autenticado. Espelha os DTOs
/// `UpdateProfessionalCategoriesDto`, `UpdateProfessionalProfileDto` e
/// `UpdateProfileDto` em `apps/api/src/modules/users/dto`.
class ProfessionalRepository {
  ProfessionalRepository(this._apiService);

  final ApiService _apiService;

  Future<Result<void>> updateCategories(List<String> categoryIds) {
    return _apiService.guard(
      () => _apiService.dio.patch('/users/me/professional/categories', data: {'categoryIds': categoryIds}),
    );
  }

  Future<Result<void>> updateProfile({String? bio, int? serviceRadiusKm}) {
    return _apiService.guard(
      () => _apiService.dio.patch(
        '/users/me/professional/profile',
        data: {
          if (bio != null) 'bio': bio,
          if (serviceRadiusKm != null) 'serviceRadiusKm': serviceRadiusKm,
        },
      ),
    );
  }

  Future<Result<void>> updateAvatar(String avatarUrl) {
    return _apiService.guard(() => _apiService.dio.patch('/users/me', data: {'avatarUrl': avatarUrl}));
  }
}
