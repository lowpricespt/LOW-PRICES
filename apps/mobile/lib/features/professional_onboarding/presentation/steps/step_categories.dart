import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../core/constants/service_categories.dart';
import '../../../../providers/app_providers.dart';
import '../../../../shared/widgets/app_error_state.dart';
import '../../../../shared/widgets/app_loading.dart';
import '../../providers/professional_onboarding_provider.dart';

class StepCategories extends ConsumerWidget {
  const StepCategories({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final theme = Theme.of(context);
    final selected = ref.watch(professionalOnboardingProvider).formData.categoryIds;
    final notifier = ref.read(professionalOnboardingProvider.notifier);
    final categoriesAsync = ref.watch(categoriesProvider);

    return SingleChildScrollView(
      padding: const EdgeInsets.all(24),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text('Em que categorias trabalhas?', style: theme.textTheme.headlineMedium),
          const SizedBox(height: 6),
          Text('Podes escolher mais do que uma.', style: theme.textTheme.bodyMedium),
          const SizedBox(height: 24),
          categoriesAsync.when(
            loading: () => const Padding(padding: EdgeInsets.only(top: 40), child: AppLoading()),
            error: (error, _) => AppErrorState(
              onRetry: () => ref.invalidate(categoriesProvider),
              description: 'Não foi possível carregar as categorias.',
            ),
            data: (categories) => Wrap(
              spacing: 8,
              runSpacing: 8,
              children: categories.map((category) {
                final isSelected = selected.contains(category.id);
                return FilterChip(
                  label: Text(category.name),
                  avatar: Icon(iconForCategorySlug(category.slug), size: 18),
                  selected: isSelected,
                  onSelected: (value) {
                    final updated = List<String>.from(selected);
                    if (value) {
                      updated.add(category.id);
                    } else {
                      updated.remove(category.id);
                    }
                    notifier.updateFormData((c) => c.copyWith(categoryIds: updated));
                  },
                );
              }).toList(),
            ),
          ),
        ],
      ),
    );
  }
}
