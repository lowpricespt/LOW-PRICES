import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../providers/professional_onboarding_provider.dart';

class StepAccount extends ConsumerStatefulWidget {
  const StepAccount({super.key});

  @override
  ConsumerState<StepAccount> createState() => _StepAccountState();
}

class _StepAccountState extends ConsumerState<StepAccount> {
  late final TextEditingController _nameController;
  late final TextEditingController _emailController;
  final _passwordController = TextEditingController(); // nunca persistido
  bool _obscurePassword = true;

  @override
  void initState() {
    super.initState();
    final formData = ref.read(professionalOnboardingProvider).formData;
    _nameController = TextEditingController(text: formData.name);
    _emailController = TextEditingController(text: formData.email);
  }

  @override
  void dispose() {
    _nameController.dispose();
    _emailController.dispose();
    _passwordController.dispose();
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
          Text('Cria a tua conta de profissional', style: theme.textTheme.headlineMedium),
          const SizedBox(height: 6),
          Text('Vais usá-la para receber e responder a pedidos.', style: theme.textTheme.bodyMedium),
          const SizedBox(height: 24),
          TextField(
            controller: _nameController,
            onChanged: (value) => notifier.updateFormData((c) => c.copyWith(name: value)),
            decoration: const InputDecoration(labelText: 'Nome ou empresa'),
          ),
          const SizedBox(height: 16),
          TextField(
            controller: _emailController,
            keyboardType: TextInputType.emailAddress,
            onChanged: (value) => notifier.updateFormData((c) => c.copyWith(email: value)),
            decoration: const InputDecoration(labelText: 'Email'),
          ),
          const SizedBox(height: 16),
          TextField(
            controller: _passwordController,
            obscureText: _obscurePassword,
            decoration: InputDecoration(
              labelText: 'Palavra-passe',
              suffixIcon: IconButton(
                icon: Icon(_obscurePassword ? Icons.visibility_outlined : Icons.visibility_off_outlined),
                onPressed: () => setState(() => _obscurePassword = !_obscurePassword),
              ),
            ),
          ),
        ],
      ),
    );
  }
}
