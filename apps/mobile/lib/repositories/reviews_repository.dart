import '../core/utils/result.dart';
import '../models/review.dart';
import '../services/api_service.dart';

/// Espelha `ReviewsController`/`reviews-api.ts` do website.
class ReviewsRepository {
  ReviewsRepository(this._apiService);

  final ApiService _apiService;

  Future<Result<ReviewsSummary>> fetchMyReviews() {
    return _apiService.guard(() async {
      final response = await _apiService.dio.get<Map<String, dynamic>>('/reviews/me');
      return ReviewsSummary.fromJson(response.data!);
    });
  }

  Future<Result<ReviewModel>> submitReview({required String jobId, required int rating, String? comment}) {
    return _apiService.guard(() async {
      final response = await _apiService.dio.post<Map<String, dynamic>>(
        '/reviews',
        data: {'jobId': jobId, 'rating': rating, if (comment != null && comment.isNotEmpty) 'comment': comment},
      );
      return ReviewModel.fromJson(response.data!);
    });
  }
}
