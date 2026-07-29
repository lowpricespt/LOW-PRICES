import 'dart:io';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../core/utils/result.dart';
import '../../../../providers/app_providers.dart';
import '../../../../repositories/storage_repository.dart';
import '../../../../shared/widgets/app_feedback.dart';
import '../../providers/request_service_provider.dart';

const _maxPhotos = 6;

class StepPhotos extends ConsumerStatefulWidget {
  const StepPhotos({super.key});

  @override
  ConsumerState<StepPhotos> createState() => _StepPhotosState();
}

class _StepPhotosState extends ConsumerState<StepPhotos> {
  bool _isUploading = false;

  Future<void> _addPhoto() async {
    final imageService = ref.read(imageServiceProvider);
    final path = await showModalBottomSheet<String?>(
      context: context,
      builder: (sheetContext) => SafeArea(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            ListTile(
              leading: const Icon(Icons.photo_camera_outlined),
              title: const Text('Tirar fotografia'),
              onTap: () async {
                final result = await imageService.pickFromCamera();
                if (sheetContext.mounted) Navigator.of(sheetContext).pop(result);
              },
            ),
            ListTile(
              leading: const Icon(Icons.photo_library_outlined),
              title: const Text('Escolher da galeria'),
              onTap: () async {
                final result = await imageService.pickFromGallery();
                if (sheetContext.mounted) Navigator.of(sheetContext).pop(result);
              },
            ),
          ],
        ),
      ),
    );
    if (path == null || !mounted) return;

    setState(() => _isUploading = true);
    final result = await ref.read(storageRepositoryProvider).uploadFile(
          file: File(path),
          folder: UploadFolder.requestPhotos,
        );
    if (!mounted) return;
    setState(() => _isUploading = false);

    switch (result) {
      case Ok(:final value):
        final notifier = ref.read(requestServiceProvider.notifier);
        final current = ref.read(requestServiceProvider).formData.photoUrls;
        notifier.updateFormData((c) => c.copyWith(photoUrls: [...current, value.url]));
      case Err(:final failure):
        if (context.mounted) showAppSnackBar(context, failure.message, isError: true);
    }
  }

  void _removePhoto(int index) {
    final current = ref.read(requestServiceProvider).formData.photoUrls;
    final updated = List<String>.from(current)..removeAt(index);
    ref.read(requestServiceProvider.notifier).updateFormData((c) => c.copyWith(photoUrls: updated));
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final photoUrls = ref.watch(requestServiceProvider).formData.photoUrls;

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
            itemCount: photoUrls.length + (photoUrls.length < _maxPhotos && !_isUploading ? 1 : 0),
            gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
              crossAxisCount: 3,
              mainAxisSpacing: 10,
              crossAxisSpacing: 10,
            ),
            itemBuilder: (context, index) {
              final isAddButton = index == photoUrls.length;
              if (isAddButton) {
                return InkWell(
                  borderRadius: BorderRadius.circular(12),
                  onTap: _addPhoto,
                  child: DottedBorderBox(theme: theme),
                );
              }
              final url = photoUrls[index];
              return ClipRRect(
                borderRadius: BorderRadius.circular(12),
                child: Stack(
                  fit: StackFit.expand,
                  children: [
                    Image.network(url, fit: BoxFit.cover),
                    Positioned(
                      right: 4,
                      top: 4,
                      child: InkWell(
                        onTap: () => _removePhoto(index),
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
          if (_isUploading) ...[
            const SizedBox(height: 16),
            const Center(child: CircularProgressIndicator(strokeWidth: 2.5)),
          ],
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
          Icon(Icons.add_a_photo_outlined, color: theme.colorScheme.onSurface.withValues(alpha: 0.6)),
          const SizedBox(height: 4),
          Text('Adicionar', style: theme.textTheme.bodySmall),
        ],
      ),
    );
  }
}
