import '../errors/failure.dart';

/// `Result<T>` representa ou um sucesso (`Ok`) ou uma falha (`Err`).
/// Usar `switch` exaustivo (o Dart obriga, por ser `sealed`) garante que
/// nenhuma chamada à API esquece de tratar o caso de erro.
///
/// Exemplo de uso:
/// ```dart
/// final result = await authRepository.login(email: email, password: password);
/// switch (result) {
///   case Ok(:final value) => // sucesso, usar `value`
///   case Err(:final failure) => showAppSnackBar(context, failure.message, isError: true);
/// }
/// ```
sealed class Result<T> {
  const Result();

  bool get isOk => this is Ok<T>;
  bool get isErr => this is Err<T>;
}

class Ok<T> extends Result<T> {
  const Ok(this.value);

  final T value;
}

class Err<T> extends Result<T> {
  const Err(this.failure);

  final Failure failure;
}
