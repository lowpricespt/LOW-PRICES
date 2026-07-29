import '../core/utils/result.dart';
import '../models/category.dart';
import '../services/api_service.dart';

class CategoriesRepository {
  CategoriesRepository(this._apiService);

  final ApiService _apiService;

  Future<Result<List<ServiceCategoryModel>>> fetchCategories() {
    return _apiService.guard(() async {
      final response = await _apiService.dio.get<List<dynamic>>('/categories');
      return response.data!
          .map((item) => ServiceCategoryModel.fromJson(item as Map<String, dynamic>))
          .toList();
    });
  }
}
