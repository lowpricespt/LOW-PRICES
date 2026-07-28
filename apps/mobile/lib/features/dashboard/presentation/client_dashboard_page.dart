import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../../shared/widgets/app_bottom_navigation.dart';
import '../../../shared/widgets/app_empty_state.dart';
import 'dashboard_scaffold.dart';
import 'dashboard_tab_stub.dart';

class ClientDashboardPage extends StatelessWidget {
  const ClientDashboardPage({super.key});

  @override
  Widget build(BuildContext context) {
    return DashboardScaffold(
      items: const [
        AppBottomNavigationItem(icon: Icons.home_outlined, selectedIcon: Icons.home, label: 'Início'),
        AppBottomNavigationItem(
          icon: Icons.assignment_outlined,
          selectedIcon: Icons.assignment,
          label: 'Pedidos',
        ),
        AppBottomNavigationItem(icon: Icons.chat_bubble_outline, selectedIcon: Icons.chat_bubble, label: 'Mensagens'),
        AppBottomNavigationItem(icon: Icons.person_outline, selectedIcon: Icons.person, label: 'Perfil'),
      ],
      pages: const [
        _ClientHomeTab(),
        DashboardTabStub(title: 'Os meus pedidos', icon: Icons.assignment_outlined),
        DashboardTabStub(title: 'Mensagens', icon: Icons.chat_bubble_outline),
        _ClientProfileTab(),
      ],
    );
  }
}

class _ClientHomeTab extends StatelessWidget {
  const _ClientHomeTab();

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
                Expanded(child: _StatCard(label: 'Pedidos ativos', value: '0')),
                SizedBox(width: 12),
                Expanded(child: _StatCard(label: 'Orçamentos', value: '0')),
              ],
            ),
            const SizedBox(height: 24),
            AppEmptyState(
              icon: Icons.assignment_outlined,
              title: 'Ainda não tens pedidos',
              description: 'Quando pedires um serviço, ele aparece aqui.',
              action: ElevatedButton(
                onPressed: () => context.push('/pedir-servico'),
                child: const Text('Pedir um serviço'),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _ClientProfileTab extends StatelessWidget {
  const _ClientProfileTab();

  @override
  Widget build(BuildContext context) {
    const items = [
      (icon: Icons.inbox_outlined, label: 'Propostas recebidas'),
      (icon: Icons.favorite_border, label: 'Favoritos'),
      (icon: Icons.history, label: 'Histórico'),
      (icon: Icons.notifications_none, label: 'Notificações'),
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
