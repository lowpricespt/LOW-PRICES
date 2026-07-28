import 'package:flutter/material.dart';

/// Envolve qualquer ecrã e mostra um overlay semitransparente com
/// spinner quando `isLoading` é `true`, bloqueando toques no conteúdo
/// por baixo. Uso típico: `LoadingOverlay(isLoading: isSubmitting, child: Form(...))`.
class LoadingOverlay extends StatelessWidget {
  const LoadingOverlay({super.key, required this.isLoading, required this.child});

  final bool isLoading;
  final Widget child;

  @override
  Widget build(BuildContext context) {
    return Stack(
      children: [
        AbsorbPointer(absorbing: isLoading, child: child),
        if (isLoading)
          Positioned.fill(
            child: Container(
              color: Theme.of(context).colorScheme.surface.withOpacity(0.6),
              child: const Center(child: CircularProgressIndicator(strokeWidth: 2.5)),
            ),
          ),
      ],
    );
  }
}
