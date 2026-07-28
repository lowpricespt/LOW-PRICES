import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../shared/widgets/app_pickers.dart';
import '../../../../providers/app_providers.dart';
import '../../providers/professional_onboarding_provider.dart';

class StepPhoto extends ConsumerWidget {
  const StepPhoto({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final theme = Theme.of(context);
    final hasPhoto = ref.watch(professionalOnboardingProvider).formData.hasProfilePhoto;
    final notifier = ref.read(professionalOnboardingProvider.notifier);
    final imageService = ref.read(imageServiceProvider);

    return SingleChildScrollView(
      padding: const EdgeInsets.all(24),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text('Adiciona uma fotografia', style: theme.textTheme.headlineMedium),
          const SizedBox(height: 6),
          Text(
            'Perfis com fotografia geram mais confiança e mais pedidos aceites.',
            style: theme.textTheme.bodyMedium,
          ),
          const SizedBox(height: 32),
          Center(
            child: InkWell(
              customBorder: const CircleBorder(),
              onTap: () async {
                final path = await showAvatarPickerSheet(
                  context,
                  onPickFromCamera: imageService.pickFromCamera,
                  onPickFromGallery: imageService.pickFromGallery,
                );
                // O ImageService ainda é stub (devolve sempre null) — a
                // flag local confirma visualmente a interação enquanto
                // o upload real não está ligado.
                notifier.updateFormData((c) => c.copyWith(hasProfilePhoto: path != null || !hasPhoto));
              },
              child: Container(
                width: 128,
                height: 128,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  border: Border.all(
                    color: hasPhoto ? theme.colorScheme.primary : theme.dividerColor,
                    width: hasPhoto ? 2 : 1,
                    style: hasPhoto ? BorderStyle.solid : BorderStyle.solid,
                  ),
                  color: hasPhoto ? theme.colorScheme.primary.withOpacity(0.08) : null,
                ),
                child: Icon(
                  Icons.camera_alt_outlined,
                  size: 32,
                  color: hasPhoto ? theme.colorScheme.primary : theme.colorScheme.onSurface.withOpacity(0.5),
                ),
              ),
            ),
          ),
          const SizedBox(height: 12),
          Center(
            child: Text(
              hasPhoto ? 'Foto adicionada' : 'Toca para adicionar',
              style: theme.textTheme.bodySmall,
            ),
          ),
        ],
      ),
    );
  }
}
