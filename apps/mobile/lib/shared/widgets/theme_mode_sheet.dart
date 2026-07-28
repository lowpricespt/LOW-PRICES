import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../providers/theme_mode_provider.dart';
import 'app_feedback.dart';

const _options = [
  (mode: ThemeMode.light, label: 'Claro', icon: Icons.light_mode_outlined),
  (mode: ThemeMode.dark, label: 'Escuro', icon: Icons.dark_mode_outlined),
  (mode: ThemeMode.system, label: 'Sistema', icon: Icons.smartphone_outlined),
];

void showThemeModeSheet(BuildContext context, WidgetRef ref) {
  final currentMode = ref.read(themeModeProvider);

  showAppBottomSheet(
    context,
    builder: (context) => Column(
      mainAxisSize: MainAxisSize.min,
      children: [
        Text('Aparência', style: Theme.of(context).textTheme.titleMedium),
        const SizedBox(height: 12),
        for (final option in _options)
          ListTile(
            leading: Icon(option.icon),
            title: Text(option.label),
            trailing: currentMode == option.mode
                ? const Icon(Icons.check_circle, color: Colors.orange)
                : null,
            onTap: () {
              ref.read(themeModeProvider.notifier).setThemeMode(option.mode);
              Navigator.of(context).pop();
            },
          ),
      ],
    ),
  );
}
