import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../shared/widgets/logo_mark.dart';
import '../../../shared/widgets/theme_mode_sheet.dart';

class HomePage extends ConsumerWidget {
  const HomePage({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final theme = Theme.of(context);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Low Prices'),
        actions: [
          IconButton(
            icon: const Icon(Icons.palette_outlined),
            tooltip: 'Aparência',
            onPressed: () => showThemeModeSheet(context, ref),
          ),
          TextButton(
            onPressed: () => context.push('/login'),
            child: const Text('Entrar'),
          ),
        ],
      ),
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 24),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              const LogoMark(size: 64),
              const SizedBox(height: 24),
              Text(
                'Encontra um profissional de confiança em menos de 2 minutos',
                textAlign: TextAlign.center,
                style: theme.textTheme.headlineMedium,
              ),
              const SizedBox(height: 12),
              Text(
                'Canalizadores, eletricistas, pintores e muito mais — perto de ti.',
                textAlign: TextAlign.center,
                style: theme.textTheme.bodyMedium,
              ),
              const SizedBox(height: 32),
              SizedBox(
                width: double.infinity,
                child: ElevatedButton(
                  onPressed: () => context.push('/pedir-servico'),
                  child: const Text('Preciso de um serviço'),
                ),
              ),
              const SizedBox(height: 12),
              SizedBox(
                width: double.infinity,
                child: OutlinedButton(
                  onPressed: () => context.push('/registo-profissional'),
                  child: const Text('Quero trabalhar'),
                ),
              ),
              const SizedBox(height: 12),
              TextButton(
                onPressed: () => context.push('/registo'),
                child: const Text('Criar conta de cliente'),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
