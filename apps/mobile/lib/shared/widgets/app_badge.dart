import 'package:flutter/material.dart';
import '../../core/theme/app_theme.dart';

enum AppBadgeVariant { primary, secondary, success, destructive }

class AppBadge extends StatelessWidget {
  const AppBadge({super.key, required this.label, this.variant = AppBadgeVariant.secondary});

  final String label;
  final AppBadgeVariant variant;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final (background, foreground) = switch (variant) {
      AppBadgeVariant.primary => (theme.colorScheme.primary.withOpacity(0.12), theme.colorScheme.primary),
      AppBadgeVariant.secondary => (theme.colorScheme.surface, theme.colorScheme.onSurface),
      AppBadgeVariant.success => (AppColors.success.withOpacity(0.12), AppColors.success),
      AppBadgeVariant.destructive => (
          theme.colorScheme.error.withOpacity(0.12),
          theme.colorScheme.error,
        ),
    };

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
      decoration: BoxDecoration(color: background, borderRadius: BorderRadius.circular(999)),
      child: Text(
        label,
        style: theme.textTheme.bodySmall?.copyWith(color: foreground, fontWeight: FontWeight.w600),
      ),
    );
  }
}
