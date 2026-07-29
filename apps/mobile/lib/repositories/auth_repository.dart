import '../core/errors/failure.dart';
import '../core/utils/result.dart';

/// Contrato do repositório de autenticação (Repository Pattern). A
/// implementação real liga-se ao `ApiService` assim que os endpoints de
/// Auth existirem no backend NestJS — todas as features de UI dependem
/// apenas desta interface e do `Result`, nunca do `ApiService`
/// diretamente nem de exceções.
abstract class AuthRepository {
  Future<Result<void>> login({required String email, required String password});

  Future<Result<void>> register({
    required String name,
    required String email,
    required String password,
    String role = 'CLIENT',
  });

  Future<void> logout();

  Future<bool> hasActiveSession();

  /// 'CLIENT' | 'PROFESSIONAL' | 'ADMIN', ou `null` sem sessão — usado só
  /// para decidir o dashboard certo no arranque da app.
  Future<String?> currentRole();
}

/// Implementação provisória: nenhuma chamada de rede ainda é feita.
/// Existe para que o resto da app (providers, navegação, guards de rota)
/// já possa ser escrito contra a interface final, sem bloquear no
/// backend. Substituir por `AuthRepositoryImpl` (usando `ApiService`)
/// quando o módulo de Autenticação estiver pronto — a assinatura não
/// muda, por isso nenhum outro ficheiro precisa de ser alterado.
class StubAuthRepository implements AuthRepository {
  @override
  Future<Result<void>> login({required String email, required String password}) async {
    return const Err(UnknownFailure('Autenticação real ainda não implementada.'));
  }

  @override
  Future<Result<void>> register({
    required String name,
    required String email,
    required String password,
    String role = 'CLIENT',
  }) async {
    return const Err(UnknownFailure('Autenticação real ainda não implementada.'));
  }

  @override
  Future<void> logout() async {}

  @override
  Future<bool> hasActiveSession() async => false;

  @override
  Future<String?> currentRole() async => null;
}
