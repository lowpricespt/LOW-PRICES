class QuoteProfessional {
  const QuoteProfessional({required this.professionalProfileId, required this.name, this.avatarUrl});

  final String professionalProfileId;
  final String name;
  final String? avatarUrl;

  factory QuoteProfessional.fromJson(Map<String, dynamic> json) {
    return QuoteProfessional(
      professionalProfileId: json['professionalProfileId'] as String,
      name: json['name'] as String,
      avatarUrl: json['avatarUrl'] as String?,
    );
  }
}

class QuoteModel {
  const QuoteModel({
    required this.id,
    required this.serviceRequestId,
    required this.status,
    required this.price,
    required this.professional,
    this.message,
  });

  final String id;
  final String serviceRequestId;
  final String status;
  final double price;
  final String? message;
  final QuoteProfessional professional;

  factory QuoteModel.fromJson(Map<String, dynamic> json) {
    return QuoteModel(
      id: json['id'] as String,
      serviceRequestId: json['serviceRequestId'] as String,
      status: json['status'] as String,
      price: (json['price'] as num).toDouble(),
      message: json['message'] as String?,
      professional: QuoteProfessional.fromJson(json['professional'] as Map<String, dynamic>),
    );
  }
}
