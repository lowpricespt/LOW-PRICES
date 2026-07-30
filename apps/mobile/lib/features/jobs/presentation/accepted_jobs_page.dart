import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/utils/result.dart';
import '../../../models/job.dart';
import '../../../providers/app_providers.dart';
import '../../../shared/widgets/app_badge.dart';
import '../../../shared/widgets/app_empty_state.dart';
import '../../../shared/widgets/app_error_state.dart';
import '../../../shared/widgets/app_skeleton.dart';

const _statusLabels = {
  'SCHEDULED': 'Agendado',
  'IN_PROGRESS': 'Em execução',
  'COMPLETED': 'Concluído',
  'CANCELLED': 'Cancelado',
};

class AcceptedJobsPage extends ConsumerStatefulWidget {
  const AcceptedJobsPage({super.key});

  @override
  ConsumerState<AcceptedJobsPage> createState() => _AcceptedJobsPageState();
}

class _AcceptedJobsPageState extends ConsumerState<AcceptedJobsPage> {
  List<JobModel>? _jobs;
  bool _hasError = false;
  String? _pendingJobId;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    final result = await ref.read(jobsRepositoryProvider).fetchMine();
    if (!mounted) return;
    switch (result) {
      case Ok(:final value):
        setState(() {
          _jobs = value;
          _hasError = false;
        });
      case Err():
        setState(() => _hasError = true);
    }
  }

  Future<void> _handleAction(String jobId, String action) async {
    setState(() => _pendingJobId = jobId);
    final repository = ref.read(jobsRepositoryProvider);
    final result = switch (action) {
      'start' => await repository.startJob(jobId),
      'complete' => await repository.completeJob(jobId),
      _ => await repository.cancelJob(jobId),
    };
    if (!mounted) return;
    setState(() => _pendingJobId = null);
    if (result.isOk) await _load();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Trabalhos aceites')),
      body: RefreshIndicator(onRefresh: _load, child: _buildBody()),
    );
  }

  Widget _buildBody() {
    if (_hasError) {
      return ListView(
        children: [AppErrorState(onRetry: _load, description: 'Não foi possível carregar os trabalhos.')],
      );
    }
    if (_jobs == null) {
      return ListView(
        padding: const EdgeInsets.all(16),
        children: List.generate(
          3,
          (index) => const Padding(
            padding: EdgeInsets.only(bottom: 12),
            child: AppSkeleton(height: 140, borderRadius: 16),
          ),
        ),
      );
    }
    if (_jobs!.isEmpty) {
      return const AppEmptyState(
        icon: Icons.assignment_turned_in_outlined,
        title: 'Ainda não tens trabalhos aceites',
        description: 'Assim que um cliente aceitar um dos teus orçamentos, aparece aqui — com o contacto dele já disponível.',
      );
    }
    return ListView.separated(
      padding: const EdgeInsets.all(16),
      itemCount: _jobs!.length,
      separatorBuilder: (_, __) => const SizedBox(height: 12),
      itemBuilder: (context, index) => _JobCard(
        job: _jobs![index],
        isPending: _pendingJobId == _jobs![index].id,
        onAction: (action) => _handleAction(_jobs![index].id, action),
      ),
    );
  }
}

class _JobCard extends StatelessWidget {
  const _JobCard({required this.job, required this.isPending, required this.onAction});

  final JobModel job;
  final bool isPending;
  final void Function(String action) onAction;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final canAct = job.status == 'SCHEDULED' || job.status == 'IN_PROGRESS';

    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(border: Border.all(color: theme.dividerColor), borderRadius: BorderRadius.circular(16)),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(job.serviceRequestTitle, style: theme.textTheme.titleSmall),
                    const SizedBox(height: 2),
                    Text(
                      '${job.price.toStringAsFixed(2).replaceAll('.', ',')} €',
                      style: theme.textTheme.bodyMedium?.copyWith(color: theme.colorScheme.primary),
                    ),
                  ],
                ),
              ),
              AppBadge(label: _statusLabels[job.status] ?? job.status),
            ],
          ),
          const SizedBox(height: 12),
          Container(
            width: double.infinity,
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(color: theme.colorScheme.surface, borderRadius: BorderRadius.circular(12)),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text('Contacto do cliente', style: theme.textTheme.bodySmall),
                const SizedBox(height: 4),
                Text(job.otherParty.name, style: theme.textTheme.titleSmall),
                const SizedBox(height: 6),
                Wrap(
                  spacing: 16,
                  runSpacing: 4,
                  children: [
                    _ContactLink(icon: Icons.mail_outline, label: job.otherParty.email),
                    if (job.otherParty.phone != null) _ContactLink(icon: Icons.phone_outlined, label: job.otherParty.phone!),
                  ],
                ),
              ],
            ),
          ),
          if (canAct) ...[
            const SizedBox(height: 12),
            Wrap(
              spacing: 8,
              runSpacing: 8,
              children: [
                if (job.status == 'SCHEDULED')
                  OutlinedButton(
                    onPressed: isPending ? null : () => onAction('start'),
                    child: const Text('Marcar como iniciado'),
                  ),
                ElevatedButton(
                  onPressed: isPending ? null : () => onAction('complete'),
                  child: const Text('Marcar como concluído'),
                ),
                TextButton(
                  onPressed: isPending ? null : () => _confirmCancel(context, onAction),
                  style: TextButton.styleFrom(foregroundColor: theme.colorScheme.error),
                  child: const Text('Cancelar'),
                ),
              ],
            ),
          ],
        ],
      ),
    );
  }

  Future<void> _confirmCancel(BuildContext context, void Function(String action) onAction) async {
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (dialogContext) => AlertDialog(
        title: const Text('Cancelar trabalho?'),
        content: const Text('A outra parte vai ser notificada por email. Esta ação não pode ser desfeita.'),
        actions: [
          TextButton(onPressed: () => Navigator.pop(dialogContext, false), child: const Text('Voltar')),
          TextButton(onPressed: () => Navigator.pop(dialogContext, true), child: const Text('Confirmar cancelamento')),
        ],
      ),
    );
    if (confirmed == true) onAction('cancel');
  }
}

class _ContactLink extends StatelessWidget {
  const _ContactLink({required this.icon, required this.label});

  final IconData icon;
  final String label;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        Icon(icon, size: 14, color: theme.colorScheme.primary),
        const SizedBox(width: 4),
        Text(label, style: theme.textTheme.bodySmall?.copyWith(color: theme.colorScheme.primary)),
      ],
    );
  }
}
