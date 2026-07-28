import 'package:flutter/material.dart';
import 'logo_horizontal.dart';

class AuthScaffold extends StatelessWidget {
  const AuthScaffold({
    super.key,
    required this.title,
    required this.description,
    required this.child,
    required this.footer,
  });

  final String title;
  final String description;
  final Widget child;
  final Widget footer;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Scaffold(
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 32),
          child: Column(
            children: [
              const LogoHorizontal(markSize: 32),
              const SizedBox(height: 32),
              Card(
                child: Padding(
                  padding: const EdgeInsets.all(24),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.stretch,
                    children: [
                      Text(title, textAlign: TextAlign.center, style: theme.textTheme.headlineMedium),
                      const SizedBox(height: 6),
                      Text(
                        description,
                        textAlign: TextAlign.center,
                        style: theme.textTheme.bodySmall,
                      ),
                      const SizedBox(height: 24),
                      child,
                    ],
                  ),
                ),
              ),
              const SizedBox(height: 20),
              footer,
            ],
          ),
        ),
      ),
    );
  }
}
