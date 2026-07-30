import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../core/utils/result.dart';
import '../../../providers/app_providers.dart';
import '../../../shared/widgets/app_feedback.dart';

class SettingsPage extends StatelessWidget {
  const SettingsPage({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Definições')),
      body: const SingleChildScrollView(
        padding: EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            _ChangePasswordCard(),
            SizedBox(height: 16),
            _ChangeEmailCard(),
            SizedBox(height: 16),
            _DeleteAccountCard(),
          ],
        ),
      ),
    );
  }
}

class _ChangePasswordCard extends ConsumerStatefulWidget {
  const _ChangePasswordCard();

  @override
  ConsumerState<_ChangePasswordCard> createState() => _ChangePasswordCardState();
}

class _ChangePasswordCardState extends ConsumerState<_ChangePasswordCard> {
  final _currentController = TextEditingController();
  final _newController = TextEditingController();
  bool _isSubmitting = false;

  @override
  void dispose() {
    _currentController.dispose();
    _newController.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    setState(() => _isSubmitting = true);
    final result = await ref.read(authRepositoryProvider).changePassword(
          currentPassword: _currentController.text,
          newPassword: _newController.text,
        );
    if (!mounted) return;
    setState(() => _isSubmitting = false);
    switch (result) {
      case Ok():
        _currentController.clear();
        _newController.clear();
        showAppSnackBar(context, 'Palavra-passe alterada com sucesso.');
      case Err(:final failure):
        showAppSnackBar(context, failure.message, isError: true);
    }
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(border: Border.all(color: theme.dividerColor), borderRadius: BorderRadius.circular(16)),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text('Alterar palavra-passe', style: theme.textTheme.titleSmall),
          const SizedBox(height: 4),
          Text(
            'Ao confirmar, todas as outras sessões abertas noutros dispositivos são terminadas.',
            style: theme.textTheme.bodySmall,
          ),
          const SizedBox(height: 12),
          TextField(
            controller: _currentController,
            obscureText: true,
            onChanged: (_) => setState(() {}),
            decoration: const InputDecoration(labelText: 'Palavra-passe atual'),
          ),
          const SizedBox(height: 10),
          TextField(
            controller: _newController,
            obscureText: true,
            onChanged: (_) => setState(() {}),
            decoration: const InputDecoration(
              labelText: 'Nova palavra-passe',
              helperText: 'Mínimo 8 caracteres, com maiúsculas, minúsculas e pelo menos um número.',
              helperMaxLines: 2,
            ),
          ),
          const SizedBox(height: 12),
          ElevatedButton(
            onPressed: (_isSubmitting || _currentController.text.isEmpty || _newController.text.isEmpty) ? null : _submit,
            child: Text(_isSubmitting ? 'A alterar…' : 'Alterar palavra-passe'),
          ),
        ],
      ),
    );
  }
}

class _ChangeEmailCard extends ConsumerStatefulWidget {
  const _ChangeEmailCard();

  @override
  ConsumerState<_ChangeEmailCard> createState() => _ChangeEmailCardState();
}

class _ChangeEmailCardState extends ConsumerState<_ChangeEmailCard> {
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();
  bool _isSubmitting = false;

  @override
  void dispose() {
    _emailController.dispose();
    _passwordController.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    setState(() => _isSubmitting = true);
    final result = await ref.read(authRepositoryProvider).requestEmailChange(
          newEmail: _emailController.text.trim(),
          currentPassword: _passwordController.text,
        );
    if (!mounted) return;
    setState(() => _isSubmitting = false);
    switch (result) {
      case Ok():
        _passwordController.clear();
        showAppSnackBar(context, 'Enviámos um link de confirmação para o novo email.');
      case Err(:final failure):
        showAppSnackBar(context, failure.message, isError: true);
    }
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(border: Border.all(color: theme.dividerColor), borderRadius: BorderRadius.circular(16)),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text('Alterar email', style: theme.textTheme.titleSmall),
          const SizedBox(height: 4),
          Text(
            'Vais receber um link de confirmação no novo endereço — o email só muda depois de confirmares.',
            style: theme.textTheme.bodySmall,
          ),
          const SizedBox(height: 12),
          TextField(
            controller: _emailController,
            keyboardType: TextInputType.emailAddress,
            onChanged: (_) => setState(() {}),
            decoration: const InputDecoration(labelText: 'Novo email'),
          ),
          const SizedBox(height: 10),
          TextField(
            controller: _passwordController,
            obscureText: true,
            onChanged: (_) => setState(() {}),
            decoration: const InputDecoration(labelText: 'Palavra-passe atual'),
          ),
          const SizedBox(height: 12),
          ElevatedButton(
            onPressed: (_isSubmitting || _emailController.text.isEmpty || _passwordController.text.isEmpty) ? null : _submit,
            child: Text(_isSubmitting ? 'A enviar…' : 'Enviar link de confirmação'),
          ),
        ],
      ),
    );
  }
}

class _DeleteAccountCard extends ConsumerStatefulWidget {
  const _DeleteAccountCard();

  @override
  ConsumerState<_DeleteAccountCard> createState() => _DeleteAccountCardState();
}

class _DeleteAccountCardState extends ConsumerState<_DeleteAccountCard> {
  bool _isConfirming = false;
  bool _isSubmitting = false;

  Future<void> _delete() async {
    setState(() => _isSubmitting = true);
    final result = await ref.read(authRepositoryProvider).deleteAccount();
    if (!mounted) return;
    switch (result) {
      case Ok():
        await ref.read(authRepositoryProvider).logout();
        if (mounted) context.go('/');
      case Err(:final failure):
        setState(() => _isSubmitting = false);
        showAppSnackBar(context, failure.message, isError: true);
    }
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(border: Border.all(color: theme.colorScheme.error.withValues(alpha: 0.4)), borderRadius: BorderRadius.circular(16)),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text('Eliminar conta', style: theme.textTheme.titleSmall?.copyWith(color: theme.colorScheme.error)),
          const SizedBox(height: 4),
          Text(
            'Esta ação é permanente. O teu histórico de pedidos e avaliações mantém-se para efeitos legais, mas deixas de conseguir entrar nesta conta.',
            style: theme.textTheme.bodySmall,
          ),
          const SizedBox(height: 12),
          if (!_isConfirming)
            OutlinedButton(
              onPressed: () => setState(() => _isConfirming = true),
              style: OutlinedButton.styleFrom(foregroundColor: theme.colorScheme.error, side: BorderSide(color: theme.colorScheme.error)),
              child: const Text('Eliminar a minha conta'),
            )
          else
            Wrap(
              spacing: 8,
              runSpacing: 8,
              children: [
                ElevatedButton(
                  onPressed: _isSubmitting ? null : _delete,
                  style: ElevatedButton.styleFrom(backgroundColor: theme.colorScheme.error),
                  child: Text(_isSubmitting ? 'A eliminar…' : 'Sim, eliminar definitivamente'),
                ),
                OutlinedButton(
                  onPressed: _isSubmitting ? null : () => setState(() => _isConfirming = false),
                  child: const Text('Cancelar'),
                ),
              ],
            ),
        ],
      ),
    );
  }
}
