import '../core/errors/failure.dart';
import '../core/utils/result.dart';

/// Resultado de um login/registo com Google — distinto de `void` porque
/// quem chama (ex.: o wizard de registo de profissional) precisa de saber
/// se ainda faltam categorias por escolher, para decidir o próximo ecrã.
class GoogleLoginOutcome {
  const GoogleLoginOutcome({required this.role, required this.requiresCategorySelection});

  final String role;
  final bool requiresCategorySelection;
}

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

  /// `role` só importa quando a conta Google ainda não existe (decide se
  /// nasce CLIENT ou PROFESSIONAL) — se já existir, é ignorado e usa-se a
  /// role já gravada. `Ok(null)` significa que o utilizador fechou o ecrã
  /// nativo do Google sem escolher conta — não é um erro, a UI não deve
  /// mostrar nada; `Err` é uma falha real (rede, servidor, não configurado).
  Future<Result<GoogleLoginOutcome?>> loginWithGoogle({String role = 'CLIENT'});

  Future<void> logout();

  Future<Result<void>> changePassword({required String currentPassword, required String newPassword});

  Future<Result<void>> requestEmailChange({required String newEmail, required String currentPassword});

  Future<Result<void>> deleteAccount();

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
  Future<Result<GoogleLoginOutcome?>> loginWithGoogle({String role = 'CLIENT'}) async {
    return const Err(UnknownFailure('Autenticação real ainda não implementada.'));
  }

  @override
  Future<void> logout() async {}

  @override
  Future<Result<void>> changePassword({required String currentPassword, required String newPassword}) async {
    return const Err(UnknownFailure('Autenticação real ainda não implementada.'));
  }

  @override
  Future<Result<void>> requestEmailChange({required String newEmail, required String currentPassword}) async {
    return const Err(UnknownFailure('Autenticação real ainda não implementada.'));
  }

  @override
  Future<Result<void>> deleteAccount() async {
    return const Err(UnknownFailure('Autenticação real ainda não implementada.'));
  }

  @override
  Future<bool> hasActiveSession() async => false;

  @override
  Future<String?> currentRole() async => null;
}
