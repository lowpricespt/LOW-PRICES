import 'package:flutter/material.dart';

class AppSearchBar extends StatelessWidget {
  const AppSearchBar({
    super.key,
    this.hintText = 'De que serviço precisas?',
    this.onSubmitted,
    this.onTap,
    this.readOnly = false,
  });

  final String hintText;
  final ValueChanged<String>? onSubmitted;
  final VoidCallback? onTap;
  final bool readOnly;

  @override
  Widget build(BuildContext context) {
    return SearchBar(
      hintText: hintText,
      leading: const Icon(Icons.search),
      onTap: onTap,
      onSubmitted: onSubmitted,
      readOnly: readOnly,
      elevation: const WidgetStatePropertyAll(0),
      shape: WidgetStatePropertyAll(
        RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(12),
          side: BorderSide(color: Theme.of(context).dividerColor),
        ),
      ),
    );
  }
}
