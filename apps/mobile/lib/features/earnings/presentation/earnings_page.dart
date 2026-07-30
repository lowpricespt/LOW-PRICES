import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/utils/result.dart';
import '../../../models/earnings_summary.dart';
import '../../../providers/app_providers.dart';
import '../../../shared/widgets/app_error_state.dart';
import '../../../shared/widgets/app_skeleton.dart';

String _formatEuros(double value) => '${value.toStringAsFixed(2).replaceAll('.', ',')} €';

class EarningsPage extends ConsumerStatefulWidget {
  const EarningsPage({super.key});

  @override
  ConsumerState<EarningsPage> createState() => _EarningsPageState();
}

class _EarningsPageState extends ConsumerState<EarningsPage> {
  EarningsSummary? _summary;
  bool _hasError = false;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    setState(() => _hasError = false);
    final result = await ref.read(jobsRepositoryProvider).fetchEarnings();
    if (!mounted) return;
    switch (result) {
      case Ok(:final value):
        setState(() => _summary = value);
      case Err():
        setState(() => _hasError = true);
    }
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Scaffold(
      appBar: AppBar(title: const Text('Ganhos')),
      body: _hasError
          ? AppErrorState(onRetry: _load, description: 'Não foi possível carregar os ganhos.')
          : _summary == null
              ? const Padding(
                  padding: EdgeInsets.all(16),
                  child: Column(
                    children: [
                      AppSkeleton(height: 100, borderRadius: 16),
                      SizedBox(height: 12),
                      AppSkeleton(height: 100, borderRadius: 16),
                    ],
                  ),
                )
              : SingleChildScrollView(
                  padding: const EdgeInsets.all(16),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      _EarningsCard(
                        title: 'Este mês',
                        amount: _summary!.currentMonthEarned,
                        jobsCount: _summary!.currentMonthJobsCount,
                      ),
                      const SizedBox(height: 12),
                      _EarningsCard(
                        title: 'Total acumulado',
                        amount: _summary!.totalEarned,
                        jobsCount: _summary!.completedJobsCount,
                        suffix: 'no total',
                      ),
                      const SizedBox(height: 16),
                      Text(_summary!.note, style: theme.textTheme.bodySmall),
                    ],
                  ),
                ),
    );
  }
}

class _EarningsCard extends StatelessWidget {
  const _EarningsCard({required this.title, required this.amount, required this.jobsCount, this.suffix});

  final String title;
  final double amount;
  final int jobsCount;
  final String? suffix;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(border: Border.all(color: theme.dividerColor), borderRadius: BorderRadius.circular(16)),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Icon(Icons.account_balance_wallet_outlined, size: 16, color: theme.colorScheme.onSurface.withValues(alpha: 0.6)),
              const SizedBox(width: 6),
              Text(title, style: theme.textTheme.bodySmall),
            ],
          ),
          const SizedBox(height: 8),
          Text(_formatEuros(amount), style: theme.textTheme.headlineMedium),
          const SizedBox(height: 4),
          Text(
            '$jobsCount trabalho${jobsCount == 1 ? '' : 's'} concluído${jobsCount == 1 ? '' : 's'}${suffix != null ? ' $suffix' : ''}',
            style: theme.textTheme.bodySmall,
          ),
        ],
      ),
    );
  }
}
