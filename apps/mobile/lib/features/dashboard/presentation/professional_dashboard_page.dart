import 'package:flutter/material.dart';
import '../../../shared/widgets/app_bottom_navigation.dart';
import '../../../shared/widgets/app_empty_state.dart';
import 'dashboard_scaffold.dart';
import 'dashboard_tab_stub.dart';

class ProfessionalDashboardPage extends StatelessWidget {
  const ProfessionalDashboardPage({super.key});

  @override
  Widget build(BuildContext context) {
    return DashboardScaffold(
      items: const [
        AppBottomNavigationItem(icon: Icons.home_outlined, selectedIcon: Icons.home, label: 'Início'),
        AppBottomNavigationItem(icon: Icons.inbox_outlined, selectedIcon: Icons.inbox, label: 'Pedidos'),
        AppBottomNavigationItem(
          icon: Icons.calendar_today_outlined,
          selectedIcon: Icons.calendar_today,
          label: 'Agenda',
        ),
        AppBottomNavigationItem(icon: Icons.person_outline, selectedIcon: Icons.person, label: 'Perfil'),
      ],
      pages: const [
        _ProfessionalHomeTab(),
        DashboardTabStub(title: 'Pedidos disponíveis', icon: Icons.inbox_outlined),
        DashboardTabStub(title: 'Agenda', icon: Icons.calendar_today_outlined),
        _ProfessionalProfileTab(),
      ],
    );
  }
}

class _ProfessionalHomeTab extends StatelessWidget {
  const _ProfessionalHomeTab();

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Olá!')),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: const [
                Expanded(child: _StatCard(label: 'Pedidos disponíveis', value: '0')),
                SizedBox(width: 12),
                Expanded(child: _StatCard(label: 'Avaliação', value: '—')),
              ],
            ),
            const SizedBox(height: 24),
            const AppEmptyState(
              icon: Icons.inbox_outlined,
              title: 'Ainda não há pedidos disponíveis',
              description: 'Assim que aparecer um pedido compatível, aparece aqui.',
            ),
          ],
        ),
      ),
    );
  }
}

class _ProfessionalProfileTab extends StatelessWidget {
  const _ProfessionalProfileTab();

  @override
  Widget build(BuildContext context) {
    const items = [
      (icon: Icons.assignment_turned_in_outlined, label: 'Trabalhos aceites'),
      (icon: Icons.chat_bubble_outline, label: 'Conversas'),
      (icon: Icons.star_border, label: 'Avaliações'),
      (icon: Icons.bar_chart_outlined, label: 'Estatísticas'),
      (icon: Icons.account_balance_wallet_outlined, label: 'Ganhos'),
      (icon: Icons.workspace_premium_outlined, label: 'Plano Premium'),
      (icon: Icons.settings_outlined, label: 'Definições'),
    ];

    return Scaffold(
      appBar: AppBar(title: const Text('Perfil')),
      body: ListView(
        children: [
          for (final item in items)
            ListTile(
              leading: Icon(item.icon),
              title: Text(item.label),
              trailing: const Icon(Icons.chevron_right),
              onTap: () {},
            ),
        ],
      ),
    );
  }
}

class _StatCard extends StatelessWidget {
  const _StatCard({required this.label, required this.value});

  final String label;
  final String value;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(border: Border.all(color: theme.dividerColor), borderRadius: BorderRadius.circular(12)),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(label, style: theme.textTheme.bodySmall),
          const SizedBox(height: 4),
          Text(value, style: theme.textTheme.headlineMedium),
        ],
      ),
    );
  }
}
