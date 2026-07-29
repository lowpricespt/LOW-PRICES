class ProfessionalOnboardingFormData {
  const ProfessionalOnboardingFormData({
    this.name = '',
    this.email = '',
    this.categoryIds = const [],
    this.radiusKm = 15,
    this.location = '',
    this.avatarUrl,
    this.description = '',
    this.uploadedDocumentIds = const [],
    this.availableDayIds = const [],
  });

  final String name;
  final String email;
  final List<String> categoryIds;
  final int radiusKm;
  final String location;
  final String? avatarUrl;
  final String description;
  final List<String> uploadedDocumentIds;
  final List<String> availableDayIds;

  ProfessionalOnboardingFormData copyWith({
    String? name,
    String? email,
    List<String>? categoryIds,
    int? radiusKm,
    String? location,
    String? avatarUrl,
    String? description,
    List<String>? uploadedDocumentIds,
    List<String>? availableDayIds,
  }) {
    return ProfessionalOnboardingFormData(
      name: name ?? this.name,
      email: email ?? this.email,
      categoryIds: categoryIds ?? this.categoryIds,
      radiusKm: radiusKm ?? this.radiusKm,
      location: location ?? this.location,
      avatarUrl: avatarUrl ?? this.avatarUrl,
      description: description ?? this.description,
      uploadedDocumentIds: uploadedDocumentIds ?? this.uploadedDocumentIds,
      availableDayIds: availableDayIds ?? this.availableDayIds,
    );
  }

  // Nota: 'password' não existe neste modelo de propósito — é mantida
  // apenas no estado local (TextEditingController) do Passo 1 e nunca
  // chega ao autosave, que grava em SharedPreferences (não encriptado).
  Map<String, dynamic> toJson() => {
        'name': name,
        'email': email,
        'categoryIds': categoryIds,
        'radiusKm': radiusKm,
        'location': location,
        'avatarUrl': avatarUrl,
        'description': description,
        'uploadedDocumentIds': uploadedDocumentIds,
        'availableDayIds': availableDayIds,
      };

  factory ProfessionalOnboardingFormData.fromJson(Map<String, dynamic> json) {
    return ProfessionalOnboardingFormData(
      name: json['name'] as String? ?? '',
      email: json['email'] as String? ?? '',
      categoryIds: (json['categoryIds'] as List<dynamic>? ?? []).cast<String>(),
      radiusKm: json['radiusKm'] as int? ?? 15,
      location: json['location'] as String? ?? '',
      avatarUrl: json['avatarUrl'] as String?,
      description: json['description'] as String? ?? '',
      uploadedDocumentIds: (json['uploadedDocumentIds'] as List<dynamic>? ?? []).cast<String>(),
      availableDayIds: (json['availableDayIds'] as List<dynamic>? ?? []).cast<String>(),
    );
  }
}
