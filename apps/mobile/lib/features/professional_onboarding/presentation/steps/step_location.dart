import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../providers/professional_onboarding_provider.dart';
import '../../../../providers/app_providers.dart';

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
    _controller = TextEditingController(text: ref.read(professionalOnboardingProvider).formData.location);
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  Future<void> _useCurrentLocation() async {
    // MapsService ainda é um stub (sem chave do Google Maps configurada
    // — ver services/maps_service.dart). O botão já está ligado ao
    // contrato certo; só falta a implementação real.
    final mapsService = ref.read(mapsServiceProvider);
    final position = await mapsService.getCurrentLocation();
    if (position == null || !mounted) return;

    final address = await mapsService.reverseGeocode(
      latitude: position.latitude,
      longitude: position.longitude,
    );
    if (address != null) {
      _controller.text = address;
      ref.read(professionalOnboardingProvider.notifier).updateFormData((c) => c.copyWith(location: address));
    }
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
          Text('Onde estás localizado?', style: theme.textTheme.headlineMedium),
          const SizedBox(height: 6),
          Text('Usamos isto em conjunto com o teu raio de atuação.', style: theme.textTheme.bodyMedium),
          const SizedBox(height: 24),
          TextField(
            controller: _controller,
            onChanged: (value) => notifier.updateFormData((c) => c.copyWith(location: value)),
            decoration: const InputDecoration(
              prefixIcon: Icon(Icons.location_on_outlined),
              hintText: 'Morada, freguesia ou código postal',
            ),
          ),
          const SizedBox(height: 12),
          OutlinedButton.icon(
            onPressed: _useCurrentLocation,
            icon: const Icon(Icons.my_location_outlined),
            label: const Text('Usar localização atual'),
          ),
        ],
      ),
    );
  }
}
