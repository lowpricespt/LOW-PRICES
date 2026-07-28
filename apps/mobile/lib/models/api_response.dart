/// Envelope genérico de resposta da API. `fromJson` recebe um
/// `fromJsonT` para saber como desserializar o campo `data`, já que Dart
/// não tem reflexão genérica em runtime.
class ApiResponse<T> {
  ApiResponse({required this.data, this.message});

  factory ApiResponse.fromJson(Map<String, dynamic> json, T Function(Object? json) fromJsonT) {
    return ApiResponse<T>(
      data: fromJsonT(json['data']),
      message: json['message'] as String?,
    );
  }

  final T data;
  final String? message;
}
