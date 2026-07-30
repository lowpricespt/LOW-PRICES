import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../core/utils/result.dart';
import '../../../providers/app_providers.dart';
import '../../../shared/widgets/app_bottom_navigation.dart';
import '../../../shared/widgets/app_empty_state.dart';
import '../../messages/presentation/conversations_page.dart';
import 'dashboard_scaffold.dart';
import 'dashboard_tab_stub.dart';

class ClientDashboardPage extends StatelessWidget {
  const ClientDashboardPage({super.key});

  @override
  Widget build(BuildContext context) {
    return const DashboardScaffold(
      items: [
        AppBottomNavigationItem(icon: Icons.home_outlined, selectedIcon: Icons.home, label: 'Início'),
        AppBottomNavigationItem(
          icon: Icons.assignment_outlined,
          selectedIcon: Icons.assignment,
          label: 'Pedidos',
        ),
        AppBottomNavigationItem(icon: Icons.chat_bubble_outline, selectedIcon: Icons.chat_bubble, label: 'Mensagens'),
        AppBottomNavigationItem(icon: Icons.person_outline, selectedIcon: Icons.person, label: 'Perfil'),
      ],
      pages: [
        _ClientHomeTab(),
        DashboardTabStub(title: 'Os meus pedidos', icon: Icons.assignment_outlined),
        ConversationsPage(),
        _ClientProfileTab(),
      ],
    );
  }
}

const _activeStatuses = {'DRAFT', 'PUBLISHED', 'IN_NEGOTIATION', 'SCHEDULED'};

class _ClientHomeTab extends ConsumerStatefulWidget {
  const _ClientHomeTab();

  @override
  ConsumerState<_ClientHomeTab> createState() => _ClientHomeTabState();
}

class _ClientHomeTabState extends ConsumerState<_ClientHomeTab> {
  int? _activeCount;
  int? _quotesCount;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    final result = await ref.read(requestsRepositoryProvider).fetchMine();
    if (!mounted) return;
    if (result case Ok(:final value)) {
      setState(() {
        _activeCount = value.where((r) => _activeStatuses.contains(r.status)).length;
        _quotesCount = value.fold<int>(0, (sum, r) => sum + r.quotesCount);
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    // Recarrega sempre que este separador (índice 0) volta a ficar
    // visível — ver nota em `dashboardTabIndexProvider`.
    ref.listen<int>(dashboardTabIndexProvider, (previous, next) {
      if (next == 0 && previous != 0) _load();
    });

    return Scaffold(
      appBar: AppBar(title: const Text('Olá!')),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Expanded(child: _StatCard(label: 'Pedidos ativos', value: _activeCount?.toString() ?? '—')),
                const SizedBox(width: 12),
                Expanded(child: _StatCard(label: 'Orçamentos', value: _quotesCount?.toString() ?? '—')),
              ],
            ),
            const SizedBox(height: 24),
            if (_activeCount == 0)
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

class _ClientProfileTab extends ConsumerWidget {
  const _ClientProfileTab();

  @override
  Widget build(BuildContext context, WidgetRef ref) {
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
          const Divider(height: 32),
          ListTile(
            leading: Icon(Icons.logout, color: Theme.of(context).colorScheme.error),
            title: Text('Sair', style: TextStyle(color: Theme.of(context).colorScheme.error)),
            onTap: () async {
              await ref.read(authRepositoryProvider).logout();
              if (context.mounted) context.go('/');
            },
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
