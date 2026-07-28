import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../core/constants/service_categories.dart';
import '../../providers/request_service_provider.dart';

class StepCategory extends ConsumerWidget {
  const StepCategory({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final theme = Theme.of(context);
    final selectedId = ref.watch(requestServiceProvider).formData.categoryId;
    final notifier = ref.read(requestServiceProvider.notifier);

    return SingleChildScrollView(
      padding: const EdgeInsets.all(24),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text('Que serviço precisas?', style: theme.textTheme.headlineMedium),
          const SizedBox(height: 6),
          Text('Escolhe a categoria que melhor descreve o teu pedido.', style: theme.textTheme.bodyMedium),
          const SizedBox(height: 24),
          GridView.builder(
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            itemCount: kServiceCategories.length,
            gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
              crossAxisCount: 2,
              mainAxisSpacing: 12,
              crossAxisSpacing: 12,
              childAspectRatio: 1.1,
            ),
            itemBuilder: (context, index) {
              final category = kServiceCategories[index];
              final isSelected = selectedId == category.id;

              return AnimatedScale(
                scale: isSelected ? 1.02 : 1,
                duration: const Duration(milliseconds: 150),
                child: InkWell(
                  borderRadius: BorderRadius.circular(16),
                  onTap: () => notifier.updateFormData((c) => c.copyWith(categoryId: category.id)),
                  child: AnimatedContainer(
                    duration: const Duration(milliseconds: 150),
                    padding: const EdgeInsets.all(16),
                    decoration: BoxDecoration(
                      borderRadius: BorderRadius.circular(16),
                      border: Border.all(
                        color: isSelected ? theme.colorScheme.primary : theme.dividerColor,
                        width: isSelected ? 1.5 : 1,
                      ),
                      color: isSelected ? theme.colorScheme.primary.withOpacity(0.06) : null,
                    ),
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Icon(
                          category.icon,
                          size: 26,
                          color: isSelected ? theme.colorScheme.primary : theme.colorScheme.onSurface,
                        ),
                        const SizedBox(height: 10),
                        Text(
                          category.name,
                          textAlign: TextAlign.center,
                          style: theme.textTheme.bodySmall?.copyWith(fontWeight: FontWeight.w600),
                        ),
                      ],
                    ),
                  ),
                ),
              );
            },
          ),
        ],
      ),
    );
  }
}
