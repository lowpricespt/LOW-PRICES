import '../core/utils/result.dart';
import '../models/service_request.dart';
import '../services/api_service.dart';

class RequestsRepository {
  RequestsRepository(this._apiService);

  final ApiService _apiService;

  /// Cria o pedido em `DRAFT` e devolve o `id` — espelha o fluxo de dois
  /// passos do website (`POST /requests` seguido de `POST /requests/:id/publish`),
  /// nunca um único endpoint "criar e publicar".
  Future<Result<String>> createRequest({
    required String categoryId,
    required String description,
    required String location,
    required String urgency,
    double? budget,
    double? latitude,
    double? longitude,
    List<String> photoUrls = const [],
  }) {
    return _apiService.guard(() async {
      final response = await _apiService.dio.post<Map<String, dynamic>>(
        '/requests',
        data: {
          'categoryId': categoryId,
          'description': description,
          'location': location,
          'urgency': urgency,
          if (budget != null) 'budget': budget,
          if (latitude != null) 'latitude': latitude,
          if (longitude != null) 'longitude': longitude,
          if (photoUrls.isNotEmpty) 'photoUrls': photoUrls,
        },
      );
      return response.data!['id'] as String;
    });
  }

  Future<Result<void>> publishRequest(String id) {
    return _apiService.guard(() => _apiService.dio.post('/requests/$id/publish'));
  }

  /// "Os meus pedidos" (cliente).
  Future<Result<List<ServiceRequestModel>>> fetchMine() {
    return _apiService.guard(() async {
      final response = await _apiService.dio.get<Map<String, dynamic>>('/requests/me', queryParameters: {'pageSize': 50});
      final items = response.data!['items'] as List<dynamic>;
      return items.map((item) => ServiceRequestModel.fromJson(item as Map<String, dynamic>)).toList();
    });
  }

  /// "Pedidos disponíveis" (profissional) — já filtrados no servidor por
  /// categoria + verificação; ver `RequestsController.findAvailable`.
  Future<Result<List<ServiceRequestModel>>> fetchAvailable() {
    return _apiService.guard(() async {
      final response =
          await _apiService.dio.get<Map<String, dynamic>>('/requests/available', queryParameters: {'pageSize': 50});
      final items = response.data!['items'] as List<dynamic>;
      return items.map((item) => ServiceRequestModel.fromJson(item as Map<String, dynamic>)).toList();
    });
  }
}
