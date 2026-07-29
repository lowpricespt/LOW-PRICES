class RequestServiceFormData {
  const RequestServiceFormData({
    this.categoryId,
    this.description = '',
    this.photoUrls = const [],
    this.location = '',
    this.urgency,
    this.budget = '',
  });

  /// UUID real de `ServiceCategory` (vindo de `GET /categories`) — nunca
  /// o slug local antigo.
  final String? categoryId;
  final String description;

  /// URLs já enviadas para o Cloudflare R2 (`POST /storage/upload`) —
  /// nunca um mero contador; cada entrada é uma foto real.
  final List<String> photoUrls;
  final String location;
  final String? urgency;
  final String budget;

  RequestServiceFormData copyWith({
    String? categoryId,
    String? description,
    List<String>? photoUrls,
    String? location,
    String? urgency,
    String? budget,
  }) {
    return RequestServiceFormData(
      categoryId: categoryId ?? this.categoryId,
      description: description ?? this.description,
      photoUrls: photoUrls ?? this.photoUrls,
      location: location ?? this.location,
      urgency: urgency ?? this.urgency,
      budget: budget ?? this.budget,
    );
  }

  Map<String, dynamic> toJson() => {
        'categoryId': categoryId,
        'description': description,
        'photoUrls': photoUrls,
        'location': location,
        'urgency': urgency,
        'budget': budget,
      };

  factory RequestServiceFormData.fromJson(Map<String, dynamic> json) {
    return RequestServiceFormData(
      categoryId: json['categoryId'] as String?,
      description: json['description'] as String? ?? '',
      photoUrls: (json['photoUrls'] as List<dynamic>? ?? []).cast<String>(),
      location: json['location'] as String? ?? '',
      urgency: json['urgency'] as String?,
      budget: json['budget'] as String? ?? '',
    );
  }
}
