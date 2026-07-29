import 'dart:io';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../core/utils/result.dart';
import '../../../../providers/app_providers.dart';
import '../../../../repositories/storage_repository.dart';
import '../../../../shared/widgets/app_feedback.dart';
import '../../../../shared/widgets/app_pickers.dart';
import '../../providers/professional_onboarding_provider.dart';

class StepPhoto extends ConsumerStatefulWidget {
  const StepPhoto({super.key});

  @override
  ConsumerState<StepPhoto> createState() => _StepPhotoState();
}

class _StepPhotoState extends ConsumerState<StepPhoto> {
  bool _isUploading = false;

  Future<void> _pickAndUpload() async {
    final imageService = ref.read(imageServiceProvider);
    final path = await showAvatarPickerSheet(
      context,
      onPickFromCamera: imageService.pickFromCamera,
      onPickFromGallery: imageService.pickFromGallery,
    );
    if (path == null || !mounted) return;

    setState(() => _isUploading = true);
    final uploadResult = await ref
        .read(storageRepositoryProvider)
        .uploadFile(file: File(path), folder: UploadFolder.avatars);

    switch (uploadResult) {
      case Err(:final failure):
        if (mounted) {
          setState(() => _isUploading = false);
          showAppSnackBar(context, failure.message, isError: true);
        }
        return;
      case Ok(:final value):
        // O avatar é gravado logo aqui (não só no fim do wizard) — a
        // conta profissional já existe nesta altura (registada no Passo
        // 1), por isso cada passo com upload guarda-se assim que
        // acontece, em vez de arriscar perder tudo se o utilizador sair
        // a meio do wizard antes do resumo final.
        final patchResult = await ref.read(professionalRepositoryProvider).updateAvatar(value.url);
        if (!mounted) return;
        setState(() => _isUploading = false);
        switch (patchResult) {
          case Err(:final failure):
            showAppSnackBar(context, failure.message, isError: true);
          case Ok():
            ref.read(professionalOnboardingProvider.notifier).updateFormData((c) => c.copyWith(avatarUrl: value.url));
        }
    }
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final avatarUrl = ref.watch(professionalOnboardingProvider).formData.avatarUrl;
    final hasPhoto = avatarUrl != null;

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
              onTap: _isUploading ? null : _pickAndUpload,
              child: Container(
                width: 128,
                height: 128,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  border: Border.all(
                    color: hasPhoto ? theme.colorScheme.primary : theme.dividerColor,
                    width: hasPhoto ? 2 : 1,
                  ),
                  color: hasPhoto ? theme.colorScheme.primary.withValues(alpha: 0.08) : null,
                  image: hasPhoto ? DecorationImage(image: NetworkImage(avatarUrl), fit: BoxFit.cover) : null,
                ),
                child: _isUploading
                    ? const Center(child: CircularProgressIndicator(strokeWidth: 2.5))
                    : hasPhoto
                        ? null
                        : Icon(
                            Icons.camera_alt_outlined,
                            size: 32,
                            color: theme.colorScheme.onSurface.withValues(alpha: 0.5),
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
