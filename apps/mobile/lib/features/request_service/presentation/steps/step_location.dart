import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../providers/request_service_provider.dart';

class StepLocation extends ConsumerStatefulWidget {
  const StepLocation({super.key});

  @override
  ConsumerState<StepLocation> createState() => _StepLocationState();
}

class _StepLocationState extends ConsumerState<StepLocation> {
  late final TextEditingController _controller;

  @override
  void initState() {
    super.initState();
    _controller = TextEditingController(text: ref.read(requestServiceProvider).formData.location);
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
          Text('Onde é o serviço?', style: theme.textTheme.headlineMedium),
          const SizedBox(height: 6),
          Text('Usamos a localização para encontrar profissionais perto de ti.', style: theme.textTheme.bodyMedium),
          const SizedBox(height: 24),
          TextField(
            controller: _controller,
            onChanged: (value) => notifier.updateFormData((c) => c.copyWith(location: value)),
            decoration: const InputDecoration(
              prefixIcon: Icon(Icons.location_on_outlined),
              hintText: 'Morada, freguesia ou código postal',
            ),
          ),
        ],
      ),
    );
  }
}
