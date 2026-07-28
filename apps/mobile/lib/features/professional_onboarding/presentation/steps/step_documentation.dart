import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../providers/professional_onboarding_provider.dart';
import '../../../../providers/app_providers.dart';

const _requiredDocs = [
  (id: 'identidade', label: 'Cartão de Cidadão ou Passaporte'),
  (id: 'atividade', label: 'Comprovativo de atividade'),
];

class StepDocumentation extends ConsumerWidget {
  const StepDocumentation({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final theme = Theme.of(context);
    final uploaded = ref.watch(professionalOnboardingProvider).formData.uploadedDocumentIds;
    final notifier = ref.read(professionalOnboardingProvider.notifier);
    final imageService = ref.read(imageServiceProvider);

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
              isUploaded: uploaded.contains(doc.id),
              onTap: () async {
                // ImageService ainda é stub — a interação e o estado
                // visual já estão prontos para quando o upload real
                // (câmara/galeria + Cloudflare R2) estiver ligado.
                await imageService.pickFromGallery();
                if (!uploaded.contains(doc.id)) {
                  notifier.updateFormData((c) => c.copyWith(uploadedDocumentIds: [...uploaded, doc.id]));
                }
              },
            ),
            const SizedBox(height: 10),
          ],
        ],
      ),
    );
  }
}

class _DocumentTile extends StatelessWidget {
  const _DocumentTile({required this.label, required this.isUploaded, required this.onTap});

  final String label;
  final bool isUploaded;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return InkWell(
      borderRadius: BorderRadius.circular(12),
      onTap: onTap,
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
            Icon(
              isUploaded ? Icons.check_circle : Icons.upload_outlined,
              color: isUploaded ? const Color(0xFF16A34A) : theme.colorScheme.onSurface.withOpacity(0.5),
            ),
          ],
        ),
      ),
    );
  }
}
