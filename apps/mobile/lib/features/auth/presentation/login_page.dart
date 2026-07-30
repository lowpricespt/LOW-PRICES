import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../core/routing/dashboard_route.dart';
import '../../../core/utils/result.dart';
import '../../../providers/app_providers.dart';
import '../../../repositories/auth_repository.dart';
import '../../../shared/widgets/app_feedback.dart';
import '../../../shared/widgets/auth_scaffold.dart';
import '../../../shared/widgets/google_sign_in_button.dart';
import '../../../shared/widgets/loading_overlay.dart';

class LoginPage extends ConsumerStatefulWidget {
  const LoginPage({super.key});

  @override
  ConsumerState<LoginPage> createState() => _LoginPageState();
}

class _LoginPageState extends ConsumerState<LoginPage> {
  final _formKey = GlobalKey<FormState>();
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();
  bool _obscurePassword = true;
  bool _isSubmitting = false;

  @override
  void dispose() {
    _emailController.dispose();
    _passwordController.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    if (!(_formKey.currentState?.validate() ?? false)) return;

    setState(() => _isSubmitting = true);
    final result = await ref.read(authRepositoryProvider).login(
          email: _emailController.text.trim(),
          password: _passwordController.text,
        );
    if (!mounted) return;
    setState(() => _isSubmitting = false);

    switch (result) {
      case Ok():
        final role = await ref.read(authRepositoryProvider).currentRole();
        if (!mounted) return;
        context.go(dashboardRouteForRole(role));
      case Err(:final failure):
        showAppSnackBar(context, failure.message, isError: true);
    }
  }

  void _handleGoogleSuccess(GoogleLoginOutcome outcome) {
    context.go(dashboardRouteForRole(outcome.role));
  }

  @override
  Widget build(BuildContext context) {
    return AuthScaffold(
      title: 'Entra na tua conta',
      description: 'Acede aos teus pedidos e conversas.',
      footer: TextButton(
        onPressed: () => context.push('/registo'),
        child: const Text.rich(
          TextSpan(
            text: 'Ainda não tens conta? ',
            children: [TextSpan(text: 'Criar conta', style: TextStyle(fontWeight: FontWeight.w600))],
          ),
        ),
      ),
      child: LoadingOverlay(
        isLoading: _isSubmitting,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            GoogleSignInButton(onSuccess: _handleGoogleSuccess),
            const SizedBox(height: 20),
            Row(
              children: [
                const Expanded(child: Divider()),
                Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 12),
                  child: Text('ou com email', style: Theme.of(context).textTheme.bodySmall),
                ),
                const Expanded(child: Divider()),
              ],
            ),
            const SizedBox(height: 20),
            _buildForm(),
          ],
        ),
      ),
    );
  }

  Widget _buildForm() {
    return Form(
          key: _formKey,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
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
                obscureText: _obscurePassword,
                decoration: InputDecoration(
                  labelText: 'Palavra-passe',
                  suffixIcon: IconButton(
                    icon: Icon(_obscurePassword ? Icons.visibility_outlined : Icons.visibility_off_outlined),
                    onPressed: () => setState(() => _obscurePassword = !_obscurePassword),
                  ),
                ),
                validator: (value) => (value == null || value.length < 8) ? 'Mínimo 8 caracteres' : null,
              ),
              const SizedBox(height: 24),
              ElevatedButton(
                onPressed: _isSubmitting ? null : _submit,
                child: const Text('Entrar'),
              ),
            ],
          ),
        );
  }
}
