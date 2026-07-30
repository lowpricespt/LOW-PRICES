import '../core/utils/result.dart';
import '../models/professional_profile.dart';
import '../services/api_service.dart';

/// Atualizações ao perfil de profissional autenticado. Espelha os DTOs
/// `UpdateProfessionalCategoriesDto`, `UpdateProfessionalProfileDto` e
/// `UpdateProfileDto` em `apps/api/src/modules/users/dto`.
class ProfessionalRepository {
  ProfessionalRepository(this._apiService);

  final ApiService _apiService;

  Future<Result<ProfessionalProfileDetails>> fetchProfile() {
    return _apiService.guard(() async {
      final response = await _apiService.dio.get<Map<String, dynamic>>('/users/me/professional/profile');
      return ProfessionalProfileDetails.fromJson(response.data!);
    });
  }

  Future<Result<void>> updateCategories(List<String> categoryIds) {
    return _apiService.guard(
      () => _apiService.dio.patch('/users/me/professional/categories', data: {'categoryIds': categoryIds}),
    );
  }

  Future<Result<void>> updateProfile({
    String? bio,
    int? serviceRadiusKm,
    String? location,
    double? latitude,
    double? longitude,
    List<String>? availableDays,
  }) {
    return _apiService.guard(
      () => _apiService.dio.patch(
        '/users/me/professional/profile',
        data: {
          if (bio != null) 'bio': bio,
          if (serviceRadiusKm != null) 'serviceRadiusKm': serviceRadiusKm,
          if (location != null) 'location': location,
          if (latitude != null) 'latitude': latitude,
          if (longitude != null) 'longitude': longitude,
          if (availableDays != null) 'availableDays': availableDays,
        },
      ),
    );
  }

  Future<Result<void>> updateAvatar(String avatarUrl) {
    return _apiService.guard(() => _apiService.dio.patch('/users/me', data: {'avatarUrl': avatarUrl}));
  }
}
