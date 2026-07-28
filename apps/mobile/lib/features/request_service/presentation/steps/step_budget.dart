import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../providers/request_service_provider.dart';

class StepBudget extends ConsumerStatefulWidget {
  const StepBudget({super.key});

  @override
  ConsumerState<StepBudget> createState() => _StepBudgetState();
}

class _StepBudgetState extends ConsumerState<StepBudget> {
  late final TextEditingController _controller;

  @override
  void initState() {
    super.initState();
    _controller = TextEditingController(text: ref.read(requestServiceProvider).formData.budget);
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
          Text('Tens um orçamento em mente?', style: theme.textTheme.headlineMedium),
          const SizedBox(height: 6),
          Text(
            'Opcional. Ajuda os profissionais a ajustarem a proposta — podes deixar em branco.',
            style: theme.textTheme.bodyMedium,
          ),
          const SizedBox(height: 24),
          TextField(
            controller: _controller,
            keyboardType: TextInputType.number,
            onChanged: (value) => notifier.updateFormData((c) => c.copyWith(budget: value)),
            decoration: const InputDecoration(prefixText: '€ ', hintText: 'Ex.: 50'),
          ),
        ],
      ),
    );
  }
}
