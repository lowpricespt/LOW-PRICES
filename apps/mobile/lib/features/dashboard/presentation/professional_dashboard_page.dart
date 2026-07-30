import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../core/utils/result.dart';
import '../../../providers/app_providers.dart';
import '../../../shared/widgets/app_bottom_navigation.dart';
import '../../../shared/widgets/app_empty_state.dart';
import '../../available_requests/presentation/available_requests_page.dart';
import 'dashboard_scaffold.dart';
import 'dashboard_tab_stub.dart';

class ProfessionalDashboardPage extends StatelessWidget {
  const ProfessionalDashboardPage({super.key});

  @override
  Widget build(BuildContext context) {
    return const DashboardScaffold(
      items: [
        AppBottomNavigationItem(icon: Icons.home_outlined, selectedIcon: Icons.home, label: 'Início'),
        AppBottomNavigationItem(icon: Icons.inbox_outlined, selectedIcon: Icons.inbox, label: 'Pedidos'),
        AppBottomNavigationItem(
          icon: Icons.calendar_today_outlined,
          selectedIcon: Icons.calendar_today,
          label: 'Agenda',
        ),
        AppBottomNavigationItem(icon: Icons.person_outline, selectedIcon: Icons.person, label: 'Perfil'),
      ],
      pages: [
        _ProfessionalHomeTab(),
        AvailableRequestsPage(),
        DashboardTabStub(title: 'Agenda', icon: Icons.calendar_today_outlined),
        _ProfessionalProfileTab(),
      ],
    );
  }
}

class _ProfessionalHomeTab extends ConsumerStatefulWidget {
  const _ProfessionalHomeTab();

  @override
  ConsumerState<_ProfessionalHomeTab> createState() => _ProfessionalHomeTabState();
}

class _ProfessionalHomeTabState extends ConsumerState<_ProfessionalHomeTab> {
  int? _availableCount;
  double? _averageRating;

  @override
  void initState() {
    super.initState();
    _loadCount();
    _loadRating();
  }

  Future<void> _loadCount() async {
    final result = await ref.read(requestsRepositoryProvider).fetchAvailable();
    if (!mounted) return;
    if (result case Ok(:final value)) {
      setState(() => _availableCount = value.length);
    }
  }

  Future<void> _loadRating() async {
    final result = await ref.read(reviewsRepositoryProvider).fetchMyReviews();
    if (!mounted) return;
    if (result case Ok(:final value)) {
      setState(() => _averageRating = value.average);
    }
  }

  @override
  Widget build(BuildContext context) {
    // Recarrega sempre que este separador (índice 0) volta a ficar
    // visível — ver nota em `dashboardTabIndexProvider`.
    ref.listen<int>(dashboardTabIndexProvider, (previous, next) {
      if (next == 0 && previous != 0) {
        _loadCount();
        _loadRating();
      }
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
                Expanded(
                  child: _StatCard(label: 'Pedidos disponíveis', value: _availableCount?.toString() ?? '—'),
                ),
                const SizedBox(width: 12),
                Expanded(child: _StatCard(label: 'Avaliação', value: _averageRating?.toStringAsFixed(1) ?? '—')),
              ],
            ),
            const SizedBox(height: 24),
            if (_availableCount == 0)
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

class _ProfessionalProfileTab extends ConsumerWidget {
  const _ProfessionalProfileTab();

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final items = [
      (icon: Icons.assignment_turned_in_outlined, label: 'Trabalhos aceites', route: '/trabalhos-aceites'),
      (icon: Icons.chat_bubble_outline, label: 'Conversas', route: '/mensagens'),
      (icon: Icons.star_border, label: 'Avaliações', route: null),
      (icon: Icons.bar_chart_outlined, label: 'Estatísticas', route: null),
      (icon: Icons.account_balance_wallet_outlined, label: 'Ganhos', route: null),
      (icon: Icons.workspace_premium_outlined, label: 'Plano Premium', route: null),
      (icon: Icons.settings_outlined, label: 'Definições', route: null),
    ];

    return Scaffold(
      appBar: AppBar(title: const Text('Perfil')),
      body: ListView(
        children: [
          for (final item in items)
            ListTile(
              leading: Icon(item.icon, color: item.route == null ? Theme.of(context).disabledColor : null),
              title: Text(
                item.label,
                style: item.route == null ? TextStyle(color: Theme.of(context).disabledColor) : null,
              ),
              trailing: item.route == null
                  ? Text('Brevemente', style: Theme.of(context).textTheme.bodySmall)
                  : const Icon(Icons.chevron_right),
              onTap: item.route == null ? null : () => context.push(item.route!),
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
