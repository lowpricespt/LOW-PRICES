import '../core/utils/result.dart';
import '../models/job.dart';
import '../services/api_service.dart';

/// Espelha `JobsController`/`jobs-api.ts` do website.
class JobsRepository {
  JobsRepository(this._apiService);

  final ApiService _apiService;

  Future<Result<List<JobModel>>> fetchMine() {
    return _apiService.guard(() async {
      final response = await _apiService.dio.get<List<dynamic>>('/jobs/me');
      return response.data!.map((item) => JobModel.fromJson(item as Map<String, dynamic>)).toList();
    });
  }

  Future<Result<JobModel>> startJob(String jobId) {
    return _apiService.guard(() async {
      final response = await _apiService.dio.patch<Map<String, dynamic>>('/jobs/$jobId/start');
      return JobModel.fromJson(response.data!);
    });
  }

  Future<Result<JobModel>> completeJob(String jobId) {
    return _apiService.guard(() async {
      final response = await _apiService.dio.patch<Map<String, dynamic>>('/jobs/$jobId/complete');
      return JobModel.fromJson(response.data!);
    });
  }

  Future<Result<JobModel>> cancelJob(String jobId, {String? reason}) {
    return _apiService.guard(() async {
      final response = await _apiService.dio.patch<Map<String, dynamic>>(
        '/jobs/$jobId/cancel',
        data: {if (reason != null) 'reason': reason},
      );
      return JobModel.fromJson(response.data!);
    });
  }
}
