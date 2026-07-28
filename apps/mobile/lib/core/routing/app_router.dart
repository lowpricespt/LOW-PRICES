import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../features/auth/presentation/login_page.dart';
import '../../features/auth/presentation/register_page.dart';
import '../../features/dashboard/presentation/client_dashboard_page.dart';
import '../../features/dashboard/presentation/professional_dashboard_page.dart';
import '../../features/home/presentation/home_page.dart';
import '../../features/onboarding/presentation/onboarding_page.dart';
import '../../features/professional_onboarding/presentation/onboarding_submitted_page.dart';
import '../../features/professional_onboarding/presentation/professional_onboarding_wizard_page.dart';
import '../../features/request_service/presentation/request_published_page.dart';
import '../../features/request_service/presentation/request_service_wizard_page.dart';
import '../../features/splash/presentation/splash_page.dart';
import '../../shared/widgets/placeholder_page.dart';

/// Nomes de rota espelham os paths do website (`/login`, `/registo`, etc.)
/// onde faz sentido, para manter as duas plataformas conceptualmente
/// alinhadas. Rotas ainda sem ecrã real usam `PlaceholderPage` — a
/// navegação já está toda preparada, o conteúdo entra nos próximos blocos.
final appRouter = GoRouter(
  initialLocation: '/splash',
  routes: [
    GoRoute(path: '/splash', name: 'splash', builder: (context, state) => const SplashPage()),
    GoRoute(path: '/onboarding', name: 'onboarding', builder: (context, state) => const OnboardingPage()),
    GoRoute(path: '/', name: 'home', builder: (context, state) => const HomePage()),
    GoRoute(path: '/login', name: 'login', builder: (context, state) => const LoginPage()),
    GoRoute(path: '/registo', name: 'registo', builder: (context, state) => const RegisterPage()),
    GoRoute(
      path: '/escolher-perfil',
      name: 'escolher-perfil',
      builder: (context, state) => const PlaceholderPage(title: 'Escolher perfil'),
    ),
    GoRoute(
      path: '/pedir-servico',
      name: 'pedir-servico',
      builder: (context, state) => const RequestServiceWizardPage(),
    ),
    GoRoute(
      path: '/pedir-servico/publicado',
      name: 'pedir-servico-publicado',
      builder: (context, state) => const RequestPublishedPage(),
    ),
    GoRoute(
      path: '/registo-profissional',
      name: 'registo-profissional',
      builder: (context, state) => const ProfessionalOnboardingWizardPage(),
    ),
    GoRoute(
      path: '/registo-profissional/enviado',
      name: 'registo-profissional-enviado',
      builder: (context, state) => const OnboardingSubmittedPage(),
    ),
    GoRoute(
      path: '/perfil',
      name: 'perfil',
      builder: (context, state) => const PlaceholderPage(title: 'Perfil', icon: Icons.person_outline_rounded),
    ),
    GoRoute(
      path: '/notificacoes',
      name: 'notificacoes',
      builder: (context, state) =>
          const PlaceholderPage(title: 'Notificações', icon: Icons.notifications_none_rounded),
    ),
    GoRoute(
      path: '/mensagens',
      name: 'mensagens',
      builder: (context, state) =>
          const PlaceholderPage(title: 'Mensagens', icon: Icons.chat_bubble_outline_rounded),
    ),
    GoRoute(
      path: '/favoritos',
      name: 'favoritos',
      builder: (context, state) =>
          const PlaceholderPage(title: 'Favoritos', icon: Icons.favorite_border_rounded),
    ),
    GoRoute(
      path: '/definicoes',
      name: 'definicoes',
      builder: (context, state) => const PlaceholderPage(title: 'Definições', icon: Icons.settings_outlined),
    ),
    GoRoute(
      path: '/dashboard-cliente',
      name: 'dashboard-cliente',
      builder: (context, state) => const ClientDashboardPage(),
    ),
    GoRoute(
      path: '/dashboard-profissional',
      name: 'dashboard-profissional',
      builder: (context, state) => const ProfessionalDashboardPage(),
    ),
  ],
);
