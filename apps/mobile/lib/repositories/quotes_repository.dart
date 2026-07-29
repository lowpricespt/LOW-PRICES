import '../core/utils/result.dart';
import '../models/quote.dart';
import '../services/api_service.dart';

/// Espelha `QuotesController`/`quotes-api.ts` do website.
class QuotesRepository {
  QuotesRepository(this._apiService);

  final ApiService _apiService;

  Future<Result<QuoteModel>> createQuote({
    required String serviceRequestId,
    required double price,
    String? message,
  }) {
    return _apiService.guard(() async {
      final response = await _apiService.dio.post<Map<String, dynamic>>(
        '/quotes',
        data: {
          'serviceRequestId': serviceRequestId,
          'price': price,
          if (message != null && message.isNotEmpty) 'message': message,
        },
      );
      return QuoteModel.fromJson(response.data!);
    });
  }

  Future<Result<List<QuoteModel>>> fetchForRequest(String serviceRequestId) {
    return _apiService.guard(() async {
      final response = await _apiService.dio.get<List<dynamic>>('/requests/$serviceRequestId/quotes');
      return response.data!.map((item) => QuoteModel.fromJson(item as Map<String, dynamic>)).toList();
    });
  }

  Future<Result<void>> acceptQuote(String quoteId) {
    return _apiService.guard(() => _apiService.dio.post('/quotes/$quoteId/accept'));
  }

  Future<Result<void>> rejectQuote(String quoteId) {
    return _apiService.guard(() => _apiService.dio.post('/quotes/$quoteId/reject'));
  }
}
