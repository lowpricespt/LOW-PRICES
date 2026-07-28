import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../providers/professional_onboarding_provider.dart';

class StepDescription extends ConsumerStatefulWidget {
  const StepDescription({super.key});

  @override
  ConsumerState<StepDescription> createState() => _StepDescriptionState();
}

class _StepDescriptionState extends ConsumerState<StepDescription> {
  late final TextEditingController _controller;

  @override
  void initState() {
    super.initState();
    _controller = TextEditingController(text: ref.read(professionalOnboardingProvider).formData.description);
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final notifier = ref.read(professionalOnboardingProvider.notifier);

    return SingleChildScrollView(
      padding: const EdgeInsets.all(24),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text('Fala-nos da tua experiência', style: theme.textTheme.headlineMedium),
          const SizedBox(height: 6),
          Text(
            'Isto aparece no teu perfil público — destaca anos de experiência e especialidades.',
            style: theme.textTheme.bodyMedium,
          ),
          const SizedBox(height: 24),
          TextField(
            controller: _controller,
            maxLines: 6,
            onChanged: (value) => notifier.updateFormData((c) => c.copyWith(description: value)),
            decoration: const InputDecoration(
              hintText: 'Ex.: Canalizador há 12 anos, especializado em reparações urgentes...',
              alignLabelWithHint: true,
            ),
          ),
        ],
      ),
    );
  }
}
