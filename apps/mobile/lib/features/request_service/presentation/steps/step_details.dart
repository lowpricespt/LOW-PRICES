import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../providers/request_service_provider.dart';

class StepDetails extends ConsumerStatefulWidget {
  const StepDetails({super.key});

  @override
  ConsumerState<StepDetails> createState() => _StepDetailsState();
}

class _StepDetailsState extends ConsumerState<StepDetails> {
  late final TextEditingController _controller;

  @override
  void initState() {
    super.initState();
    _controller = TextEditingController(text: ref.read(requestServiceProvider).formData.description);
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final notifier = ref.read(requestServiceProvider.notifier);

    return SingleChildScrollView(
      padding: const EdgeInsets.all(24),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text('Descreve o que precisas', style: theme.textTheme.headlineMedium),
          const SizedBox(height: 6),
          Text(
            'Quanto mais detalhes deres, melhores serão os orçamentos que vais receber.',
            style: theme.textTheme.bodyMedium,
          ),
          const SizedBox(height: 24),
          TextField(
            controller: _controller,
            maxLines: 6,
            onChanged: (value) => notifier.updateFormData((c) => c.copyWith(description: value)),
            decoration: const InputDecoration(
              hintText: 'Ex.: Tenho uma fuga de água por baixo do lava-loiças na cozinha...',
              alignLabelWithHint: true,
            ),
          ),
        ],
      ),
    );
  }
}
