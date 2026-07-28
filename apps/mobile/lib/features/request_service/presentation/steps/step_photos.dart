import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../providers/request_service_provider.dart';

const _maxPhotos = 6;

class StepPhotos extends ConsumerWidget {
  const StepPhotos({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final theme = Theme.of(context);
    final photoCount = ref.watch(requestServiceProvider).formData.photoCount;
    final notifier = ref.read(requestServiceProvider.notifier);

    return SingleChildScrollView(
      padding: const EdgeInsets.all(24),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text('Adiciona fotografias', style: theme.textTheme.headlineMedium),
          const SizedBox(height: 6),
          Text(
            'Opcional, mas ajuda os profissionais a perceberem melhor o trabalho. Até $_maxPhotos fotos.',
            style: theme.textTheme.bodyMedium,
          ),
          const SizedBox(height: 24),
          GridView.builder(
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            itemCount: photoCount + (photoCount < _maxPhotos ? 1 : 0),
            gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
              crossAxisCount: 3,
              mainAxisSpacing: 10,
              crossAxisSpacing: 10,
            ),
            itemBuilder: (context, index) {
              final isAddButton = index == photoCount;
              if (isAddButton) {
                return InkWell(
                  borderRadius: BorderRadius.circular(12),
                  onTap: () => notifier.updateFormData((c) => c.copyWith(photoCount: c.photoCount + 1)),
                  child: DottedBorderBox(theme: theme),
                );
              }
              return Container(
                decoration: BoxDecoration(
                  color: theme.colorScheme.surface,
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Stack(
                  children: [
                    Center(child: Text('Foto ${index + 1}', style: theme.textTheme.bodySmall)),
                    Positioned(
                      right: 4,
                      top: 4,
                      child: InkWell(
                        onTap: () => notifier.updateFormData((c) => c.copyWith(photoCount: c.photoCount - 1)),
                        child: CircleAvatar(
                          radius: 12,
                          backgroundColor: theme.scaffoldBackgroundColor,
                          child: const Icon(Icons.close, size: 14),
                        ),
                      ),
                    ),
                  ],
                ),
              );
            },
          ),
        ],
      ),
    );
  }
}

class DottedBorderBox extends StatelessWidget {
  const DottedBorderBox({super.key, required this.theme});

  final ThemeData theme;

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        border: Border.all(color: theme.dividerColor),
        borderRadius: BorderRadius.circular(12),
      ),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(Icons.add_a_photo_outlined, color: theme.colorScheme.onSurface.withOpacity(0.6)),
          const SizedBox(height: 4),
          Text('Adicionar', style: theme.textTheme.bodySmall),
        ],
      ),
    );
  }
}
