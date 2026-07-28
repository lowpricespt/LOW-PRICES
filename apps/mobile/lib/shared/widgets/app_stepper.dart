import 'package:flutter/material.dart';

class AppStepper extends StatelessWidget {
  const AppStepper({super.key, required this.currentStepIndex, required this.stepLabels});

  final int currentStepIndex;
  final List<String> stepLabels;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final total = stepLabels.length;
    final progress = (currentStepIndex + 1) / total;

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text(
              'Passo ${currentStepIndex + 1} de $total',
              style: theme.textTheme.bodySmall?.copyWith(fontWeight: FontWeight.w600),
            ),
            Flexible(
              child: Text(
                stepLabels[currentStepIndex],
                overflow: TextOverflow.ellipsis,
                textAlign: TextAlign.end,
                style: theme.textTheme.bodySmall,
              ),
            ),
          ],
        ),
        const SizedBox(height: 8),
        ClipRRect(
          borderRadius: BorderRadius.circular(999),
          child: TweenAnimationBuilder<double>(
            tween: Tween(begin: 0, end: progress),
            duration: const Duration(milliseconds: 300),
            curve: Curves.easeOut,
            builder: (context, value, _) => LinearProgressIndicator(
              value: value,
              minHeight: 6,
              backgroundColor: theme.colorScheme.surface,
              valueColor: AlwaysStoppedAnimation(theme.colorScheme.primary),
            ),
          ),
        ),
      ],
    );
  }
}
