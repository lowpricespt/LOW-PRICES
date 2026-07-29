import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../core/utils/result.dart';
import '../../../providers/app_providers.dart';
import '../../../shared/widgets/app_feedback.dart';
import '../../../shared/widgets/auth_scaffold.dart';
import '../../../shared/widgets/loading_overlay.dart';

class RegisterPage extends ConsumerStatefulWidget {
  const RegisterPage({super.key});

  @override
  ConsumerState<RegisterPage> createState() => _RegisterPageState();
}

class _RegisterPageState extends ConsumerState<RegisterPage> {
  final _formKey = GlobalKey<FormState>();
  final _nameController = TextEditingController();
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();
  bool _isSubmitting = false;

  @override
  void dispose() {
    _nameController.dispose();
    _emailController.dispose();
    _passwordController.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    if (!(_formKey.currentState?.validate() ?? false)) return;

    setState(() => _isSubmitting = true);
    final result = await ref.read(authRepositoryProvider).register(
          name: _nameController.text.trim(),
          email: _emailController.text.trim(),
          password: _passwordController.text,
        );
    if (!mounted) return;
    setState(() => _isSubmitting = false);

    switch (result) {
      case Ok():
        context.go('/dashboard-cliente');
      case Err(:final failure):
        showAppSnackBar(context, failure.message, isError: true);
    }
  }

  @override
  Widget build(BuildContext context) {
    return AuthScaffold(
      title: 'Cria a tua conta',
      description: 'Pede serviços e acompanha os teus orçamentos.',
      footer: Column(
        children: [
          TextButton(
            onPressed: () => context.push('/login'),
            child: const Text.rich(
              TextSpan(
                text: 'Já tens conta? ',
                children: [TextSpan(text: 'Entrar', style: TextStyle(fontWeight: FontWeight.w600))],
              ),
            ),
          ),
          TextButton(
            onPressed: () => context.push('/registo-profissional'),
            child: const Text('Sou profissional'),
          ),
        ],
      ),
      child: LoadingOverlay(
        isLoading: _isSubmitting,
        child: Form(
          key: _formKey,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              TextFormField(
                controller: _nameController,
                decoration: const InputDecoration(labelText: 'Nome'),
                validator: (value) => (value == null || value.trim().isEmpty) ? 'Indica o teu nome' : null,
              ),
              const SizedBox(height: 16),
              TextFormField(
                controller: _emailController,
                keyboardType: TextInputType.emailAddress,
                decoration: const InputDecoration(labelText: 'Email', hintText: 'tu@exemplo.com'),
                validator: (value) =>
                    (value == null || !value.contains('@')) ? 'Introduz um email válido' : null,
              ),
              const SizedBox(height: 16),
              TextFormField(
                controller: _passwordController,
                obscureText: true,
                decoration: const InputDecoration(labelText: 'Palavra-passe', hintText: 'Mínimo 8 caracteres'),
                validator: (value) => (value == null || value.length < 8) ? 'Mínimo 8 caracteres' : null,
              ),
              const SizedBox(height: 24),
              ElevatedButton(
                onPressed: _isSubmitting ? null : _submit,
                child: const Text('Criar conta'),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
