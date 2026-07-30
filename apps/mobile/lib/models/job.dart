class JobContact {
  const JobContact({required this.name, required this.email, this.phone});

  final String name;
  final String email;
  final String? phone;

  factory JobContact.fromJson(Map<String, dynamic> json) {
    return JobContact(
      name: json['name'] as String,
      email: json['email'] as String,
      phone: json['phone'] as String?,
    );
  }
}

class JobModel {
  const JobModel({
    required this.id,
    required this.status,
    required this.serviceRequestId,
    required this.quoteId,
    required this.serviceRequestTitle,
    required this.price,
    required this.scheduledStart,
    required this.scheduledEnd,
    required this.completedAt,
    required this.hasReview,
    required this.otherParty,
  });

  final String id;
  final String status;
  final String serviceRequestId;
  final String quoteId;
  final String serviceRequestTitle;
  final double price;
  final DateTime? scheduledStart;
  final DateTime? scheduledEnd;
  final DateTime? completedAt;
  final bool hasReview;
  final JobContact otherParty;

  factory JobModel.fromJson(Map<String, dynamic> json) {
    return JobModel(
      id: json['id'] as String,
      status: json['status'] as String,
      serviceRequestId: json['serviceRequestId'] as String,
      quoteId: json['quoteId'] as String,
      serviceRequestTitle: json['serviceRequestTitle'] as String,
      price: (json['price'] as num).toDouble(),
      scheduledStart: json['scheduledStart'] == null ? null : DateTime.parse(json['scheduledStart'] as String),
      scheduledEnd: json['scheduledEnd'] == null ? null : DateTime.parse(json['scheduledEnd'] as String),
      completedAt: json['completedAt'] == null ? null : DateTime.parse(json['completedAt'] as String),
      hasReview: json['hasReview'] as bool,
      otherParty: JobContact.fromJson(json['otherParty'] as Map<String, dynamic>),
    );
  }
}
