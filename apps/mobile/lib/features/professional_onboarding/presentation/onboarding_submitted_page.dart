import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

class OnboardingSubmittedPage extends StatelessWidget {
  const OnboardingSubmittedPage({super.key});

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Scaffold(
      body: Center(
        child: Padding(
          padding: const EdgeInsets.all(24),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              TweenAnimationBuilder<double>(
                tween: Tween(begin: 0, end: 1),
                duration: const Duration(milliseconds: 400),
                curve: Curves.elasticOut,
                builder: (context, value, child) => Transform.scale(scale: value, child: child),
                child: Container(
                  width: 72,
                  height: 72,
                  decoration: const BoxDecoration(color: Color(0x1A16A34A), shape: BoxShape.circle),
                  child: const Icon(Icons.celebration_outlined, color: Color(0xFF16A34A), size: 36),
                ),
              ),
              const SizedBox(height: 20),
              Text('Registo enviado!', style: theme.textTheme.headlineMedium),
              const SizedBox(height: 8),
              Text(
                'Vamos rever o teu perfil e avisar-te por email assim que estiver aprovado.',
                textAlign: TextAlign.center,
                style: theme.textTheme.bodyMedium,
              ),
              const SizedBox(height: 28),
              SizedBox(
                width: double.infinity,
                child: ElevatedButton(
                  onPressed: () => context.go('/dashboard-profissional'),
                  child: const Text('Ir para o painel'),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
