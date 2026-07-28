import 'package:flutter/material.dart';

class AppErrorState extends StatelessWidget {
  const AppErrorState({
    super.key,
    this.title = 'Algo correu mal',
    this.description = 'Não foi possível carregar esta informação.',
    this.onRetry,
  });

  final String title;
  final String description;
  final VoidCallback? onRetry;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Center(
      child: Padding(
        padding: const EdgeInsets.all(32),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(Icons.error_outline_rounded, size: 40, color: theme.colorScheme.error),
            const SizedBox(height: 12),
            Text(title, textAlign: TextAlign.center, style: theme.textTheme.titleMedium),
            const SizedBox(height: 6),
            Text(description, textAlign: TextAlign.center, style: theme.textTheme.bodySmall),
            if (onRetry != null) ...[
              const SizedBox(height: 16),
              OutlinedButton(onPressed: onRetry, child: const Text('Tentar novamente')),
            ],
          ],
        ),
      ),
    );
  }
}
