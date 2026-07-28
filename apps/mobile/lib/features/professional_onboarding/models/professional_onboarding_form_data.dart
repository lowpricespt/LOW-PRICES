class ProfessionalOnboardingFormData {
  const ProfessionalOnboardingFormData({
    this.name = '',
    this.email = '',
    this.categoryIds = const [],
    this.radiusKm = 15,
    this.location = '',
    this.hasProfilePhoto = false,
    this.description = '',
    this.uploadedDocumentIds = const [],
    this.availableDayIds = const [],
  });

  final String name;
  final String email;
  final List<String> categoryIds;
  final int radiusKm;
  final String location;
  final bool hasProfilePhoto;
  final String description;
  final List<String> uploadedDocumentIds;
  final List<String> availableDayIds;

  ProfessionalOnboardingFormData copyWith({
    String? name,
    String? email,
    List<String>? categoryIds,
    int? radiusKm,
    String? location,
    bool? hasProfilePhoto,
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
      hasProfilePhoto: hasProfilePhoto ?? this.hasProfilePhoto,
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
        'hasProfilePhoto': hasProfilePhoto,
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
      hasProfilePhoto: json['hasProfilePhoto'] as bool? ?? false,
      description: json['description'] as String? ?? '',
      uploadedDocumentIds: (json['uploadedDocumentIds'] as List<dynamic>? ?? []).cast<String>(),
      availableDayIds: (json['availableDayIds'] as List<dynamic>? ?? []).cast<String>(),
    );
  }
}
