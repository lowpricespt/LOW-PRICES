import '../core/utils/result.dart';
import '../models/message.dart';
import '../services/api_service.dart';

/// Espelha `MessagesController`/`messages-api.ts` do website.
class MessagesRepository {
  MessagesRepository(this._apiService);

  final ApiService _apiService;

  Future<Result<List<ConversationModel>>> fetchMyConversations() {
    return _apiService.guard(() async {
      final response = await _apiService.dio.get<List<dynamic>>('/conversations/me');
      return response.data!.map((item) => ConversationModel.fromJson(item as Map<String, dynamic>)).toList();
    });
  }

  Future<Result<List<MessageModel>>> fetchMessages(String quoteId) {
    return _apiService.guard(() async {
      final response = await _apiService.dio.get<List<dynamic>>('/quotes/$quoteId/messages');
      return response.data!.map((item) => MessageModel.fromJson(item as Map<String, dynamic>)).toList();
    });
  }

  Future<Result<MessageModel>> sendMessage(String quoteId, String body) {
    return _apiService.guard(() async {
      final response = await _apiService.dio.post<Map<String, dynamic>>(
        '/quotes/$quoteId/messages',
        data: {'body': body},
      );
      return MessageModel.fromJson(response.data!);
    });
  }
}
