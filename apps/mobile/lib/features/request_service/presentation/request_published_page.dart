import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

class RequestPublishedPage extends StatelessWidget {
  const RequestPublishedPage({super.key});

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
                  child: const Icon(Icons.check_circle, color: Color(0xFF16A34A), size: 40),
                ),
              ),
              const SizedBox(height: 20),
              Text('Pedido publicado!', style: theme.textTheme.headlineMedium),
              const SizedBox(height: 8),
              Text(
                'Vais receber uma notificação assim que um profissional enviar o primeiro orçamento.',
                textAlign: TextAlign.center,
                style: theme.textTheme.bodyMedium,
              ),
              const SizedBox(height: 28),
              SizedBox(
                width: double.infinity,
                child: ElevatedButton(
                  onPressed: () => context.go('/dashboard-cliente'),
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
