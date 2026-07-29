class ServiceCategoryModel {
  const ServiceCategoryModel({required this.id, required this.name, required this.slug});

  final String id;
  final String name;
  final String slug;

  factory ServiceCategoryModel.fromJson(Map<String, dynamic> json) {
    return ServiceCategoryModel(
      id: json['id'] as String,
      name: json['name'] as String,
      slug: json['slug'] as String,
    );
  }
}
