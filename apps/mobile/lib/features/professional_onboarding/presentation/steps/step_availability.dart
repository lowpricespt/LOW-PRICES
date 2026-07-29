import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../providers/professional_onboarding_provider.dart';

const _weekdays = [
  (id: 'seg', label: 'Seg'),
  (id: 'ter', label: 'Ter'),
  (id: 'qua', label: 'Qua'),
  (id: 'qui', label: 'Qui'),
  (id: 'sex', label: 'Sex'),
  (id: 'sab', label: 'Sáb'),
  (id: 'dom', label: 'Dom'),
];

class StepAvailability extends ConsumerWidget {
  const StepAvailability({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final theme = Theme.of(context);
    final selectedDays = ref.watch(professionalOnboardingProvider).formData.availableDayIds;
    final notifier = ref.read(professionalOnboardingProvider.notifier);

    return SingleChildScrollView(
      padding: const EdgeInsets.all(24),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text('Quando estás disponível?', style: theme.textTheme.headlineMedium),
          const SizedBox(height: 6),
          Text(
            'Por agora isto fica só guardado neste dispositivo — a disponibilidade semanal real ainda não '
            'tem suporte no servidor (só bloqueios de datas específicas, na Agenda).',
            style: theme.textTheme.bodyMedium,
          ),
          const SizedBox(height: 24),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: _weekdays.map((day) {
              final isSelected = selectedDays.contains(day.id);
              return Expanded(
                child: Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 3),
                  child: InkWell(
                    borderRadius: BorderRadius.circular(10),
                    onTap: () {
                      final updated = List<String>.from(selectedDays);
                      if (isSelected) {
                        updated.remove(day.id);
                      } else {
                        updated.add(day.id);
                      }
                      notifier.updateFormData((c) => c.copyWith(availableDayIds: updated));
                    },
                    child: Container(
                      padding: const EdgeInsets.symmetric(vertical: 12),
                      decoration: BoxDecoration(
                        borderRadius: BorderRadius.circular(10),
                        border: Border.all(
                          color: isSelected ? theme.colorScheme.primary : theme.dividerColor,
                        ),
                        color: isSelected ? theme.colorScheme.primary.withValues(alpha: 0.08) : null,
                      ),
                      child: Text(
                        day.label,
                        textAlign: TextAlign.center,
                        style: theme.textTheme.bodySmall?.copyWith(
                          fontWeight: FontWeight.w600,
                          color: isSelected ? theme.colorScheme.primary : null,
                        ),
                      ),
                    ),
                  ),
                ),
              );
            }).toList(),
          ),
        ],
      ),
    );
  }
}
