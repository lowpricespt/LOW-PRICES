class RequestServiceFormData {
  const RequestServiceFormData({
    this.categoryId,
    this.description = '',
    this.photoCount = 0,
    this.location = '',
    this.urgency,
    this.budget = '',
  });

  final String? categoryId;
  final String description;
  final int photoCount;
  final String location;
  final String? urgency;
  final String budget;

  RequestServiceFormData copyWith({
    String? categoryId,
    String? description,
    int? photoCount,
    String? location,
    String? urgency,
    String? budget,
  }) {
    return RequestServiceFormData(
      categoryId: categoryId ?? this.categoryId,
      description: description ?? this.description,
      photoCount: photoCount ?? this.photoCount,
      location: location ?? this.location,
      urgency: urgency ?? this.urgency,
      budget: budget ?? this.budget,
    );
  }

  Map<String, dynamic> toJson() => {
        'categoryId': categoryId,
        'description': description,
        'photoCount': photoCount,
        'location': location,
        'urgency': urgency,
        'budget': budget,
      };

  factory RequestServiceFormData.fromJson(Map<String, dynamic> json) {
    return RequestServiceFormData(
      categoryId: json['categoryId'] as String?,
      description: json['description'] as String? ?? '',
      photoCount: json['photoCount'] as int? ?? 0,
      location: json['location'] as String? ?? '',
      urgency: json['urgency'] as String?,
      budget: json['budget'] as String? ?? '',
    );
  }
}
