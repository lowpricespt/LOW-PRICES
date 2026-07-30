class EarningsSummary {
  const EarningsSummary({
    required this.totalEarned,
    required this.completedJobsCount,
    required this.currentMonthEarned,
    required this.currentMonthJobsCount,
    required this.note,
  });

  final double totalEarned;
  final int completedJobsCount;
  final double currentMonthEarned;
  final int currentMonthJobsCount;
  final String note;

  factory EarningsSummary.fromJson(Map<String, dynamic> json) {
    return EarningsSummary(
      totalEarned: (json['totalEarned'] as num).toDouble(),
      completedJobsCount: json['completedJobsCount'] as int,
      currentMonthEarned: (json['currentMonthEarned'] as num).toDouble(),
      currentMonthJobsCount: json['currentMonthJobsCount'] as int,
      note: json['note'] as String,
    );
  }
}
