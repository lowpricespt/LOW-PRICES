import 'dart:io';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../core/utils/result.dart';
import '../../../../providers/app_providers.dart';
import '../../../../repositories/documents_repository.dart';
import '../../../../repositories/storage_repository.dart';
import '../../../../shared/widgets/app_feedback.dart';
import '../../providers/professional_onboarding_provider.dart';

const _requiredDocs = [
  (type: ProfessionalDocumentType.identity, label: 'Cartão de Cidadão ou Passaporte'),
  (type: ProfessionalDocumentType.proofOfActivity, label: 'Comprovativo de atividade'),
];

class StepDocumentation extends ConsumerStatefulWidget {
  const StepDocumentation({super.key});

  @override
  ConsumerState<StepDocumentation> createState() => _StepDocumentationState();
}

class _StepDocumentationState extends ConsumerState<StepDocumentation> {
  ProfessionalDocumentType? _uploadingType;

  Future<void> _pickAndUpload(ProfessionalDocumentType type) async {
    final imageService = ref.read(imageServiceProvider);
    final path = await imageService.pickFromGallery();
    if (path == null || !mounted) return;

    setState(() => _uploadingType = type);

    final uploadResult =
        await ref.read(storageRepositoryProvider).uploadFile(file: File(path), folder: UploadFolder.documents);

    switch (uploadResult) {
      case Err(:final failure):
        if (mounted) {
          setState(() => _uploadingType = null);
          showAppSnackBar(context, failure.message, isError: true);
        }
        return;
      case Ok(:final value):
        final upsertResult = await ref.read(documentsRepositoryProvider).upsert(type: type, key: value.key);
        if (!mounted) return;
        setState(() => _uploadingType = null);
        switch (upsertResult) {
          case Err(:final failure):
            showAppSnackBar(context, failure.message, isError: true);
          case Ok():
            final notifier = ref.read(professionalOnboardingProvider.notifier);
            final uploaded = ref.read(professionalOnboardingProvider).formData.uploadedDocumentIds;
            if (!uploaded.contains(type.value)) {
              notifier.updateFormData((c) => c.copyWith(uploadedDocumentIds: [...uploaded, type.value]));
            }
        }
    }
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final uploaded = ref.watch(professionalOnboardingProvider).formData.uploadedDocumentIds;

    return SingleChildScrollView(
      padding: const EdgeInsets.all(24),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text('Verificação de identidade', style: theme.textTheme.headlineMedium),
          const SizedBox(height: 6),
          Text(
            'Precisamos destes documentos para confirmar que és um profissional verificado.',
            style: theme.textTheme.bodyMedium,
          ),
          const SizedBox(height: 24),
          for (final doc in _requiredDocs) ...[
            _DocumentTile(
              label: doc.label,
              isUploaded: uploaded.contains(doc.type.value),
              isUploading: _uploadingType == doc.type,
              onTap: () => _pickAndUpload(doc.type),
            ),
            const SizedBox(height: 10),
          ],
        ],
      ),
    );
  }
}

class _DocumentTile extends StatelessWidget {
  const _DocumentTile({
    required this.label,
    required this.isUploaded,
    required this.isUploading,
    required this.onTap,
  });

  final String label;
  final bool isUploaded;
  final bool isUploading;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return InkWell(
      borderRadius: BorderRadius.circular(12),
      onTap: isUploading ? null : onTap,
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: isUploaded ? const Color(0xFF16A34A) : theme.dividerColor),
          color: isUploaded ? const Color(0x1416A34A) : null,
        ),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Expanded(child: Text(label, style: theme.textTheme.bodyMedium?.copyWith(fontWeight: FontWeight.w600))),
            if (isUploading)
              const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(strokeWidth: 2))
            else
              Icon(
                isUploaded ? Icons.check_circle : Icons.upload_outlined,
                color: isUploaded ? const Color(0xFF16A34A) : theme.colorScheme.onSurface.withValues(alpha: 0.5),
              ),
          ],
        ),
      ),
    );
  }
}
