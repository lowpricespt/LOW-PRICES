import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../core/utils/result.dart';
import '../../providers/app_providers.dart';
import '../../repositories/auth_repository.dart';
import 'app_feedback.dart';

/// Botão "Continuar com Google" reutilizável — mesmo aspeto e
/// comportamento em Entrar, Criar conta e Passo 1 do registo de
/// profissional. Gere o próprio estado de carregamento e trata
/// erro/cancelamento; quem usa só recebe `onSuccess` quando há mesmo
/// sessão nova.
class GoogleSignInButton extends ConsumerStatefulWidget {
  const GoogleSignInButton({super.key, this.role = 'CLIENT', required this.onSuccess});

  final String role;
  final void Function(GoogleLoginOutcome outcome) onSuccess;

  @override
  ConsumerState<GoogleSignInButton> createState() => _GoogleSignInButtonState();
}

class _GoogleSignInButtonState extends ConsumerState<GoogleSignInButton> {
  bool _isLoading = false;

  Future<void> _handleTap() async {
    setState(() => _isLoading = true);
    final result = await ref.read(authRepositoryProvider).loginWithGoogle(role: widget.role);
    if (!mounted) return;
    setState(() => _isLoading = false);

    switch (result) {
      case Ok(:final value):
        if (value != null) widget.onSuccess(value);
      case Err(:final failure):
        showAppSnackBar(context, failure.message, isError: true);
    }
  }

  @override
  Widget build(BuildContext context) {
    return OutlinedButton.icon(
      onPressed: _isLoading ? null : _handleTap,
      icon: _isLoading
          ? const SizedBox(width: 16, height: 16, child: CircularProgressIndicator(strokeWidth: 2))
          : const _GoogleLogo(),
      label: Text(_isLoading ? 'A continuar…' : 'Continuar com Google'),
    );
  }
}

class _GoogleLogo extends StatelessWidget {
  const _GoogleLogo();

  @override
  Widget build(BuildContext context) {
    return const SizedBox(
      width: 16,
      height: 16,
      child: Icon(Icons.g_mobiledata_rounded, size: 20),
    );
  }
}
