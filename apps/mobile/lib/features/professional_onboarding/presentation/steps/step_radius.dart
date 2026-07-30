import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../providers/professional_onboarding_provider.dart';

class StepRadius extends ConsumerWidget {
  const StepRadius({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final theme = Theme.of(context);
    final radiusKm = ref.watch(professionalOnboardingProvider).formData.radiusKm;
    final notifier = ref.read(professionalOnboardingProvider.notifier);

    return SingleChildScrollView(
      padding: const EdgeInsets.all(24),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text('Até onde estás disposto a deslocar-te?', style: theme.textTheme.headlineMedium),
          const SizedBox(height: 6),
          Text(
            'Guardado no teu perfil para quando a filtragem por distância real for ativada — por agora, '
            'a categoria escolhida é o que decide que pedidos vês.',
            style: theme.textTheme.bodyMedium,
          ),
          const SizedBox(height: 24),
          Container(
            padding: const EdgeInsets.all(24),
            decoration: BoxDecoration(border: Border.all(color: theme.dividerColor), borderRadius: BorderRadius.circular(16)),
            child: Column(
              children: [
                Text(
                  '$radiusKm km',
                  style: theme.textTheme.headlineLarge?.copyWith(color: theme.colorScheme.primary),
                ),
                Slider(
                  value: radiusKm.toDouble(),
                  min: 1,
                  max: 150,
                  divisions: 149,
                  label: '$radiusKm km',
                  onChanged: (value) =>
                      notifier.updateFormData((c) => c.copyWith(radiusKm: value.round())),
                ),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text('1 km', style: theme.textTheme.bodySmall),
                    Text('150 km', style: theme.textTheme.bodySmall),
                  ],
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
