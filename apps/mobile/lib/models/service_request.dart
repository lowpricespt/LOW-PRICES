class RequestCategory {
  const RequestCategory({required this.id, required this.name, required this.slug});

  final String id;
  final String name;
  final String slug;

  factory RequestCategory.fromJson(Map<String, dynamic> json) {
    return RequestCategory(
      id: json['id'] as String,
      name: json['name'] as String,
      slug: json['slug'] as String? ?? '',
    );
  }
}

class MyQuoteSummary {
  const MyQuoteSummary({required this.id, required this.price, required this.status});

  final String id;
  final double price;
  final String status;

  factory MyQuoteSummary.fromJson(Map<String, dynamic> json) {
    return MyQuoteSummary(
      id: json['id'] as String,
      price: (json['price'] as num).toDouble(),
      status: json['status'] as String,
    );
  }
}

/// Espelha `ServiceRequestResponseDto` da API — usado tanto em "Os meus
/// pedidos" (cliente) como em "Pedidos disponíveis" (profissional).
class ServiceRequestModel {
  const ServiceRequestModel({
    required this.id,
    required this.status,
    required this.category,
    required this.description,
    required this.location,
    required this.urgency,
    required this.budget,
    required this.createdAt,
    required this.quotesCount,
    required this.isLocationUnlocked,
    this.myQuote,
  });

  final String id;
  final String status;
  final RequestCategory category;
  final String description;
  final String location;
  final String urgency;
  final double? budget;
  final DateTime createdAt;
  final int quotesCount;
  final bool isLocationUnlocked;
  final MyQuoteSummary? myQuote;

  factory ServiceRequestModel.fromJson(Map<String, dynamic> json) {
    return ServiceRequestModel(
      id: json['id'] as String,
      status: json['status'] as String,
      category: RequestCategory.fromJson(json['category'] as Map<String, dynamic>),
      description: json['description'] as String,
      location: json['location'] as String,
      urgency: json['urgency'] as String,
      budget: (json['budget'] as num?)?.toDouble(),
      createdAt: DateTime.parse(json['createdAt'] as String),
      quotesCount: json['quotesCount'] as int? ?? 0,
      isLocationUnlocked: json['isLocationUnlocked'] as bool? ?? true,
      myQuote: json['myQuote'] == null
          ? null
          : MyQuoteSummary.fromJson(json['myQuote'] as Map<String, dynamic>),
    );
  }
}
