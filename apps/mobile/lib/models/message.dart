class ConversationModel {
  const ConversationModel({
    required this.quoteId,
    required this.serviceRequestTitle,
    required this.otherPartyName,
    required this.status,
    required this.unreadCount,
  });

  final String quoteId;
  final String serviceRequestTitle;
  final String otherPartyName;
  final String status;
  final int unreadCount;

  factory ConversationModel.fromJson(Map<String, dynamic> json) {
    return ConversationModel(
      quoteId: json['quoteId'] as String,
      serviceRequestTitle: json['serviceRequestTitle'] as String,
      otherPartyName: json['otherPartyName'] as String,
      status: json['status'] as String,
      unreadCount: json['unreadCount'] as int,
    );
  }
}

class MessageModel {
  const MessageModel({
    required this.id,
    required this.quoteId,
    required this.body,
    required this.createdAt,
    required this.isMine,
    required this.senderName,
  });

  final String id;
  final String quoteId;
  final String body;
  final DateTime createdAt;
  final bool isMine;
  final String senderName;

  factory MessageModel.fromJson(Map<String, dynamic> json) {
    return MessageModel(
      id: json['id'] as String,
      quoteId: json['quoteId'] as String,
      body: json['body'] as String,
      createdAt: DateTime.parse(json['createdAt'] as String),
      isMine: json['isMine'] as bool,
      senderName: json['senderName'] as String,
    );
  }
}
