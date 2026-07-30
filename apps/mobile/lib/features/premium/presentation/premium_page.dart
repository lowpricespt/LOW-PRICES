import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/utils/result.dart';
import '../../../models/area_access.dart';
import '../../../providers/app_providers.dart';
import '../../../shared/widgets/app_badge.dart';
import '../../../shared/widgets/app_feedback.dart';
import '../../../shared/widgets/app_skeleton.dart';

const _sharedBenefits = [
  'Acesso a todos os pedidos da tua área e arredores',
  'Sem limite de orçamentos enviados',
  'Destaque nos resultados de pesquisa dos clientes',
  'Estatísticas detalhadas de desempenho',
  'Suporte prioritário',
];

String _formatEuros(int cents) => '${(cents / 100).toStringAsFixed(2).replaceAll('.', ',')} €';

class PremiumPage extends ConsumerStatefulWidget {
  const PremiumPage({super.key});

  @override
  ConsumerState<PremiumPage> createState() => _PremiumPageState();
}

class _PremiumPageState extends ConsumerState<PremiumPage> {
  AreaAccessPlans? _plans;
  AreaAccessStatus? _status;
  bool _hasError = false;
  String? _activatingPlan;

  @override
  void initState() {
    super.initState();
    _loadPlans();
    _loadStatus();
  }

  Future<void> _loadPlans() async {
    final result = await ref.read(pricingRepositoryProvider).fetchPlans();
    if (!mounted) return;
    switch (result) {
      case Ok(:final value):
        setState(() => _plans = value);
      case Err():
        setState(() => _hasError = true);
    }
  }

  Future<void> _loadStatus() async {
    final result = await ref.read(pricingRepositoryProvider).fetchMyStatus();
    if (!mounted) return;
    if (result case Ok(:final value)) {
      setState(() => _status = value);
    }
  }

  Future<void> _activate(String plan) async {
    setState(() => _activatingPlan = plan);
    final result = await ref.read(pricingRepositoryProvider).activateSimulated(plan);
    if (!mounted) return;
    setState(() => _activatingPlan = null);
    switch (result) {
      case Ok():
        _loadStatus();
      case Err(:final failure):
        showAppSnackBar(context, failure.message, isError: true);
    }
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Scaffold(
      appBar: AppBar(title: const Text('Plano Premium')),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            if (_status?.isActive == true)
              Container(
                width: double.infinity,
                margin: const EdgeInsets.only(bottom: 16),
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  border: Border.all(color: theme.colorScheme.primary.withValues(alpha: 0.4)),
                  color: theme.colorScheme.primary.withValues(alpha: 0.05),
                  borderRadius: BorderRadius.circular(16),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const AppBadge(label: 'Plano ativo', variant: AppBadgeVariant.primary),
                    const SizedBox(height: 6),
                    Text(
                      '${_status!.subscriptionTier == 'MONTHLY' ? 'Plano Mensal' : 'Plano Semanal'} — expira em '
                      '${_status!.areaAccessExpiresAt != null ? _formatDate(_status!.areaAccessExpiresAt!) : '—'}',
                      style: theme.textTheme.bodySmall,
                    ),
                  ],
                ),
              ),
            if (_hasError)
              Text('Não foi possível carregar os planos. Tenta recarregar.', style: TextStyle(color: theme.colorScheme.error))
            else if (_plans == null)
              const Column(children: [AppSkeleton(height: 180, borderRadius: 16), SizedBox(height: 12), AppSkeleton(height: 180, borderRadius: 16)])
            else ...[
              _PlanCard(
                title: 'Plano Semanal',
                priceLabel: '${_formatEuros(_plans!.weekly.amount)} /semana',
                detail: 'Equivale a ${_formatEuros(_plans!.weekly.amount * 4)} se renovares as 4 semanas do mês',
                extraBenefit: 'Sem compromisso — cancela quando quiseres, semana a semana',
                isActivating: _activatingPlan == 'weekly',
                onActivate: () => _activate('weekly'),
              ),
              const SizedBox(height: 12),
              _PlanCard(
                title: 'Plano Mensal',
                priceLabel: '${_formatEuros(_plans!.monthly.amount)} /mês',
                detail: 'Poupas ${_formatEuros(_plans!.weekly.amount * 4 - _plans!.monthly.amount)}/mês face a pagar 4 semanas separadas',
                extraBenefit: 'Um único pagamento e uma única fatura por mês',
                isActivating: _activatingPlan == 'monthly',
                onActivate: () => _activate('monthly'),
                highlighted: true,
              ),
            ],
            const SizedBox(height: 16),
            Container(
              width: double.infinity,
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(border: Border.all(color: theme.dividerColor), borderRadius: BorderRadius.circular(16)),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text('Incluído nos dois planos', style: theme.textTheme.titleSmall),
                  const SizedBox(height: 10),
                  for (final benefit in _sharedBenefits)
                    Padding(
                      padding: const EdgeInsets.only(bottom: 6),
                      child: Row(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Icon(Icons.check, size: 16, color: theme.colorScheme.primary),
                          const SizedBox(width: 8),
                          Expanded(child: Text(benefit, style: theme.textTheme.bodySmall)),
                        ],
                      ),
                    ),
                ],
              ),
            ),
            const SizedBox(height: 12),
            Text(
              'Os pagamentos reais (Stripe) ainda não estão ligados — por isso a ativação é gratuita neste piloto.',
              style: theme.textTheme.bodySmall,
            ),
          ],
        ),
      ),
    );
  }

  String _formatDate(DateTime date) => '${date.day.toString().padLeft(2, '0')}/${date.month.toString().padLeft(2, '0')}/${date.year}';
}

class _PlanCard extends StatelessWidget {
  const _PlanCard({
    required this.title,
    required this.priceLabel,
    required this.detail,
    required this.extraBenefit,
    required this.isActivating,
    required this.onActivate,
    this.highlighted = false,
  });

  final String title;
  final String priceLabel;
  final String detail;
  final String extraBenefit;
  final bool isActivating;
  final VoidCallback onActivate;
  final bool highlighted;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        border: Border.all(color: highlighted ? theme.colorScheme.primary : theme.dividerColor, width: highlighted ? 2 : 1),
        borderRadius: BorderRadius.circular(16),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Icon(Icons.workspace_premium_outlined, size: 16, color: highlighted ? theme.colorScheme.primary : null),
              const SizedBox(width: 6),
              Text(title, style: theme.textTheme.titleSmall?.copyWith(color: highlighted ? theme.colorScheme.primary : null)),
              if (highlighted) ...[
                const Spacer(),
                const AppBadge(label: 'Mais popular', variant: AppBadgeVariant.primary),
              ],
            ],
          ),
          const SizedBox(height: 10),
          Text(priceLabel, style: theme.textTheme.headlineMedium),
          const SizedBox(height: 4),
          Text(detail, style: theme.textTheme.bodySmall),
          const SizedBox(height: 16),
          SizedBox(
            width: double.infinity,
            child: highlighted
                ? ElevatedButton(
                    onPressed: isActivating ? null : onActivate,
                    child: Text(isActivating ? 'A ativar…' : 'Ativar (grátis — modo piloto)'),
                  )
                : OutlinedButton(
                    onPressed: isActivating ? null : onActivate,
                    child: Text(isActivating ? 'A ativar…' : 'Ativar (grátis — modo piloto)'),
                  ),
          ),
          const SizedBox(height: 10),
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Icon(Icons.check, size: 16, color: theme.colorScheme.primary),
              const SizedBox(width: 8),
              Expanded(child: Text(extraBenefit, style: theme.textTheme.bodySmall)),
            ],
          ),
        ],
      ),
    );
  }
}
