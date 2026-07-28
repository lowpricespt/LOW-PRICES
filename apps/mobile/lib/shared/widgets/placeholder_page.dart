import 'package:flutter/material.dart';
import 'app_empty_state.dart';

class PlaceholderPage extends StatelessWidget {
  const PlaceholderPage({super.key, required this.title, this.icon = Icons.construction_rounded});

  final String title;
  final IconData icon;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text(title)),
      body: AppEmptyState(
        icon: icon,
        title: '$title — em construção',
        description: 'Este ecrã fica pronto num próximo bloco de desenvolvimento.',
      ),
    );
  }
}
