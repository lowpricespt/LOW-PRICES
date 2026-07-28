import 'package:flutter/material.dart';
import '../../../shared/widgets/app_empty_state.dart';

class DashboardTabStub extends StatelessWidget {
  const DashboardTabStub({super.key, required this.title, this.icon = Icons.construction_rounded});

  final String title;
  final IconData icon;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text(title)),
      body: AppEmptyState(
        icon: icon,
        title: '$title — em construção',
        description: 'Esta secção fica pronta num próximo bloco de desenvolvimento.',
      ),
    );
  }
}
