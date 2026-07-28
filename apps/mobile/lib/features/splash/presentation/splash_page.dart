import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../providers/app_providers.dart';
import '../../../shared/widgets/logo_mark.dart';

class SplashPage extends ConsumerStatefulWidget {
  const SplashPage({super.key});

  @override
  ConsumerState<SplashPage> createState() => _SplashPageState();
}

class _SplashPageState extends ConsumerState<SplashPage> {
  @override
  void initState() {
    super.initState();
    _bootstrap();
  }

  Future<void> _bootstrap() async {
    final authRepository = ref.read(authRepositoryProvider);
    final hasSession = await authRepository.hasActiveSession();

    // Pausa curta apenas para o logótipo não "piscar" — sem lógica de
    // negócio associada.
    await Future.delayed(const Duration(milliseconds: 500));
    if (!mounted) return;

    // Quando existir sessão real, isto deve navegar para o dashboard
    // correto (cliente ou profissional) em vez da home.
    context.go(hasSession ? '/' : '/');
  }

  @override
  Widget build(BuildContext context) {
    return const Scaffold(
      body: Center(child: LogoMark(size: 72)),
    );
  }
}
