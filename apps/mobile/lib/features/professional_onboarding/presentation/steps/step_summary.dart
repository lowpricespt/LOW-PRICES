import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../providers/app_providers.dart';
import '../../providers/professional_onboarding_provider.dart';

class StepSummary extends ConsumerWidget {
  const StepSummary({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final theme = Theme.of(context);
    final formData = ref.watch(professionalOnboardingProvider).formData;
    final categories = ref.watch(categoriesProvider).valueOrNull ?? const [];

    final categoryNames = categories
        .where((category) => formData.categoryIds.contains(category.id))
        .map((category) => category.name)
        .join(', ');

    return SingleChildScrollView(
      padding: const EdgeInsets.all(24),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text('Só falta confirmar', style: theme.textTheme.headlineMedium),
          const SizedBox(height: 6),
          Text(
            'A tua conta fica pendente de verificação — costuma demorar menos de 24 horas.',
            style: theme.textTheme.bodyMedium,
          ),
          const SizedBox(height: 24),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 16),
            decoration: BoxDecoration(border: Border.all(color: theme.dividerColor), borderRadius: BorderRadius.circular(12)),
            child: Column(
              children: [
                _Row(label: 'Nome', value: formData.name.isEmpty ? '—' : formData.name),
                _Row(label: 'Categorias', value: categoryNames.isEmpty ? '—' : categoryNames),
                _Row(label: 'Raio de atuação', value: '${formData.radiusKm} km'),
                _Row(label: 'Localização', value: formData.location.isEmpty ? '—' : formData.location),
                _Row(
                  label: 'Documentos',
                  value: '${formData.uploadedDocumentIds.length} de 2 enviados',
                  isLast: true,
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _Row extends StatelessWidget {
  const _Row({required this.label, required this.value, this.isLast = false});

  final String label;
  final String value;
  final bool isLast;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Container(
      padding: const EdgeInsets.symmetric(vertical: 12),
      decoration: BoxDecoration(border: isLast ? null : Border(bottom: BorderSide(color: theme.dividerColor))),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(label, style: theme.textTheme.bodySmall),
          Flexible(
            child: Text(
              value,
              textAlign: TextAlign.end,
              style: theme.textTheme.bodyMedium?.copyWith(fontWeight: FontWeight.w600),
            ),
          ),
        ],
      ),
    );
  }
}
