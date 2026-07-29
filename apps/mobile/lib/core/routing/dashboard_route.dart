/// Rota do dashboard certo para um `role` de `User` ('CLIENT' |
/// 'PROFESSIONAL' | 'ADMIN'). Sem sessão (`role == null`) ou um role que
/// ainda não tem dashboard próprio (ex.: ADMIN) cai na home pública — a
/// mesma decisão que o `hasActiveSession` original já tomava por omissão.
String dashboardRouteForRole(String? role) {
  return switch (role) {
    'CLIENT' => '/dashboard-cliente',
    'PROFESSIONAL' => '/dashboard-profissional',
    _ => '/',
  };
}
