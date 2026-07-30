import '../core/utils/result.dart';
import '../models/area_access.dart';
import '../services/api_service.dart';

/// Espelha `PricingController`/`pricing-api.ts` do website.
class PricingRepository {
  PricingRepository(this._apiService);

  final ApiService _apiService;

  Future<Result<AreaAccessPlans>> fetchPlans() {
    return _apiService.guard(() async {
      final response = await _apiService.dio.get<Map<String, dynamic>>('/pricing/area-access');
      return AreaAccessPlans.fromJson(response.data!);
    });
  }

  Future<Result<AreaAccessStatus>> fetchMyStatus() {
    return _apiService.guard(() async {
      final response = await _apiService.dio.get<Map<String, dynamic>>('/pricing/area-access/me');
      return AreaAccessStatus.fromJson(response.data!);
    });
  }

  Future<Result<void>> activateSimulated(String plan) {
    return _apiService.guard(
      () => _apiService.dio.post('/pricing/area-access/activate-simulated', data: {'plan': plan}),
    );
  }
}
