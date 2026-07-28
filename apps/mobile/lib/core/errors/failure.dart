/// Hierarquia de falhas da aplicação. Qualquer erro que atravesse uma
/// camada (repository → provider → UI) deve ser um `Failure`, nunca uma
/// `Exception` genérica — assim a UI consegue decidir a mensagem/ação
/// certa sem ter de interpretar strings.
sealed class Failure {
  const Failure(this.message);

  final String message;
}

class NetworkFailure extends Failure {
  const NetworkFailure([super.message = 'Não foi possível contactar o servidor.']);
}

class ServerFailure extends Failure {
  const ServerFailure(super.message, {this.statusCode});

  final int? statusCode;
}

class ValidationFailure extends Failure {
  const ValidationFailure(super.message, {this.fieldErrors = const {}});

  final Map<String, String> fieldErrors;
}

class UnauthorizedFailure extends Failure {
  const UnauthorizedFailure([super.message = 'A tua sessão expirou. Inicia sessão novamente.']);
}

class UnknownFailure extends Failure {
  const UnknownFailure([super.message = 'Ocorreu um erro inesperado.']);
}
