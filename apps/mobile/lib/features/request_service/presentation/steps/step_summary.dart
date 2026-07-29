import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../providers/app_providers.dart';
import '../../providers/request_service_provider.dart';

const _urgencyLabels = {
  'hoje': 'Hoje',
  'esta-semana': 'Esta semana',
  'este-mes': 'Este mês',
  'sem-urgencia': 'Sem urgência',
};

class StepSummary extends ConsumerWidget {
  const StepSummary({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final theme = Theme.of(context);
    final formData = ref.watch(requestServiceProvider).formData;
    final categories = ref.watch(categoriesProvider).valueOrNull ?? const [];
    String? categoryName;
    for (final category in categories) {
      if (category.id == formData.categoryId) {
        categoryName = category.name;
        break;
      }
    }

    return SingleChildScrollView(
      padding: const EdgeInsets.all(24),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text('Confirma o teu pedido', style: theme.textTheme.headlineMedium),
          const SizedBox(height: 6),
          Text('Revê tudo antes de publicares.', style: theme.textTheme.bodyMedium),
          const SizedBox(height: 24),
          Container(
            decoration: BoxDecoration(border: Border.all(color: theme.dividerColor), borderRadius: BorderRadius.circular(12)),
            padding: const EdgeInsets.symmetric(horizontal: 16),
            child: Column(
              children: [
                _SummaryRow(label: 'Categoria', value: categoryName ?? '—'),
                _SummaryRow(label: 'Localização', value: formData.location.isEmpty ? '—' : formData.location),
                _SummaryRow(label: 'Urgência', value: _urgencyLabels[formData.urgency] ?? '—'),
                _SummaryRow(label: 'Orçamento', value: formData.budget.isEmpty ? 'Não indicado' : '${formData.budget} €'),
                _SummaryRow(label: 'Fotografias', value: '${formData.photoUrls.length}', isLast: true),
              ],
            ),
          ),
          if (formData.description.isNotEmpty) ...[
            const SizedBox(height: 16),
            Container(
              width: double.infinity,
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(color: theme.colorScheme.surface, borderRadius: BorderRadius.circular(12)),
              child: Text(formData.description, style: theme.textTheme.bodySmall),
            ),
          ],
        ],
      ),
    );
  }
}

class _SummaryRow extends StatelessWidget {
  const _SummaryRow({required this.label, required this.value, this.isLast = false});

  final String label;
  final String value;
  final bool isLast;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Container(
      padding: const EdgeInsets.symmetric(vertical: 12),
      decoration: BoxDecoration(
        border: isLast ? null : Border(bottom: BorderSide(color: theme.dividerColor)),
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(label, style: theme.textTheme.bodySmall),
          Text(value, style: theme.textTheme.bodyMedium?.copyWith(fontWeight: FontWeight.w600)),
        ],
      ),
    );
  }
}
