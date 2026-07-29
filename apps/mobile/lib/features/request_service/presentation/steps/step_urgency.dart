import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../providers/request_service_provider.dart';

const _urgencyOptions = [
  (id: 'hoje', label: 'Hoje'),
  (id: 'esta-semana', label: 'Esta semana'),
  (id: 'este-mes', label: 'Este mês'),
  (id: 'sem-urgencia', label: 'Sem urgência'),
];

class StepUrgency extends ConsumerWidget {
  const StepUrgency({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final theme = Theme.of(context);
    final selected = ref.watch(requestServiceProvider).formData.urgency;
    final notifier = ref.read(requestServiceProvider.notifier);

    return SingleChildScrollView(
      padding: const EdgeInsets.all(24),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text('Para quando precisas?', style: theme.textTheme.headlineMedium),
          const SizedBox(height: 6),
          Text('Isto ajuda os profissionais a organizarem a agenda.', style: theme.textTheme.bodyMedium),
          const SizedBox(height: 24),
          for (final option in _urgencyOptions) ...[
            _UrgencyTile(
              label: option.label,
              isSelected: selected == option.id,
              onTap: () => notifier.updateFormData((c) => c.copyWith(urgency: option.id)),
            ),
            const SizedBox(height: 10),
          ],
        ],
      ),
    );
  }
}

class _UrgencyTile extends StatelessWidget {
  const _UrgencyTile({required this.label, required this.isSelected, required this.onTap});

  final String label;
  final bool isSelected;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return InkWell(
      borderRadius: BorderRadius.circular(12),
      onTap: onTap,
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 150),
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(12),
          border: Border.all(
            color: isSelected ? theme.colorScheme.primary : theme.dividerColor,
            width: isSelected ? 1.5 : 1,
          ),
          color: isSelected ? theme.colorScheme.primary.withValues(alpha: 0.06) : null,
        ),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text(label, style: theme.textTheme.bodyMedium?.copyWith(fontWeight: FontWeight.w600)),
            Icon(
              isSelected ? Icons.radio_button_checked : Icons.radio_button_unchecked,
              color: isSelected ? theme.colorScheme.primary : theme.dividerColor,
              size: 20,
            ),
          ],
        ),
      ),
    );
  }
}
