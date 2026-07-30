class ReviewModel {
  const ReviewModel({
    required this.id,
    required this.jobId,
    required this.rating,
    required this.comment,
    required this.createdAt,
    this.clientName,
  });

  final String id;
  final String jobId;
  final int rating;
  final String? comment;
  final DateTime createdAt;
  final String? clientName;

  factory ReviewModel.fromJson(Map<String, dynamic> json) {
    return ReviewModel(
      id: json['id'] as String,
      jobId: json['jobId'] as String,
      rating: json['rating'] as int,
      comment: json['comment'] as String?,
      createdAt: DateTime.parse(json['createdAt'] as String),
      clientName: json['clientName'] as String?,
    );
  }
}

class ReviewsSummary {
  const ReviewsSummary({required this.average, required this.count, required this.items});

  final double? average;
  final int count;
  final List<ReviewModel> items;

  factory ReviewsSummary.fromJson(Map<String, dynamic> json) {
    return ReviewsSummary(
      average: (json['average'] as num?)?.toDouble(),
      count: json['count'] as int,
      items: (json['items'] as List<dynamic>).map((item) => ReviewModel.fromJson(item as Map<String, dynamic>)).toList(),
    );
  }
}
