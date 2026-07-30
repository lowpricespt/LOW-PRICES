import 'category.dart';

class ProfessionalProfileDetails {
  const ProfessionalProfileDetails({
    required this.bio,
    required this.serviceRadiusKm,
    required this.location,
    required this.latitude,
    required this.longitude,
    required this.availableDays,
    required this.verificationStatus,
    required this.avatarUrl,
    required this.categories,
  });

  final String? bio;
  final int serviceRadiusKm;
  final String? location;
  final double? latitude;
  final double? longitude;
  final List<String> availableDays;
  final String verificationStatus;
  final String? avatarUrl;
  final List<ServiceCategoryModel> categories;

  factory ProfessionalProfileDetails.fromJson(Map<String, dynamic> json) {
    return ProfessionalProfileDetails(
      bio: json['bio'] as String?,
      serviceRadiusKm: json['serviceRadiusKm'] as int,
      location: json['location'] as String?,
      latitude: (json['latitude'] as num?)?.toDouble(),
      longitude: (json['longitude'] as num?)?.toDouble(),
      availableDays: (json['availableDays'] as List<dynamic>).map((day) => day as String).toList(),
      verificationStatus: json['verificationStatus'] as String,
      avatarUrl: json['avatarUrl'] as String?,
      categories: (json['categories'] as List<dynamic>)
          .map((item) => ServiceCategoryModel.fromJson(item as Map<String, dynamic>))
          .toList(),
    );
  }
}
