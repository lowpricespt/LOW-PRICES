class PaginatedResponse<T> {
  PaginatedResponse({required this.items, required this.page, required this.pageSize, required this.total});

  factory PaginatedResponse.fromJson(Map<String, dynamic> json, T Function(Object? json) fromJsonT) {
    final rawItems = json['items'] as List<dynamic>? ?? [];
    return PaginatedResponse<T>(
      items: rawItems.map(fromJsonT).toList(),
      page: json['page'] as int? ?? 1,
      pageSize: json['pageSize'] as int? ?? rawItems.length,
      total: json['total'] as int? ?? rawItems.length,
    );
  }

  final List<T> items;
  final int page;
  final int pageSize;
  final int total;

  bool get hasNextPage => page * pageSize < total;
}
