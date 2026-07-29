import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/utils/result.dart';
import '../../../models/service_request.dart';
import '../../../providers/app_providers.dart';
import '../../../shared/widgets/app_badge.dart';
import '../../../shared/widgets/app_empty_state.dart';
import '../../../shared/widgets/app_error_state.dart';
import '../../../shared/widgets/app_feedback.dart';
import '../../../shared/widgets/app_skeleton.dart';

const _urgencyLabels = {
  'hoje': 'Hoje',
  'esta-semana': 'Esta semana',
  'este-mes': 'Este mês',
  'sem-urgencia': 'Sem urgência',
};

class AvailableRequestsPage extends ConsumerStatefulWidget {
  const AvailableRequestsPage({super.key});

  @override
  ConsumerState<AvailableRequestsPage> createState() => _AvailableRequestsPageState();
}

class _AvailableRequestsPageState extends ConsumerState<AvailableRequestsPage> {
  List<ServiceRequestModel>? _requests;
  bool _hasError = false;
  String? _expandedRequestId;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    setState(() {
      _requests = null;
      _hasError = false;
    });
    final result = await ref.read(requestsRepositoryProvider).fetchAvailable();
    if (!mounted) return;
    switch (result) {
      case Ok(:final value):
        setState(() => _requests = value);
      case Err():
        setState(() => _hasError = true);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Pedidos disponíveis')),
      body: RefreshIndicator(
        onRefresh: _load,
        child: _buildBody(),
      ),
    );
  }

  Widget _buildBody() {
    if (_hasError) {
      return ListView(
        children: [AppErrorState(onRetry: _load, description: 'Não foi possível carregar os pedidos.')],
      );
    }
    if (_requests == null) {
      return ListView(
        padding: const EdgeInsets.all(16),
        children: List.generate(
          3,
          (index) => const Padding(
            padding: EdgeInsets.only(bottom: 12),
            child: AppSkeleton(height: 110, borderRadius: 16),
          ),
        ),
      );
    }
    if (_requests!.isEmpty) {
      return ListView(
        children: const [
          AppEmptyState(
            icon: Icons.inbox_outlined,
            title: 'Sem pedidos disponíveis de momento',
            description: 'Assim que houver um pedido novo compatível com as tuas categorias, aparece aqui.',
          ),
        ],
      );
    }
    return ListView.separated(
      padding: const EdgeInsets.all(16),
      itemCount: _requests!.length,
      separatorBuilder: (_, __) => const SizedBox(height: 12),
      itemBuilder: (context, index) => _RequestCard(
        request: _requests![index],
        isFormOpen: _expandedRequestId == _requests![index].id,
        onToggleForm: () => setState(() {
          _expandedRequestId = _expandedRequestId == _requests![index].id ? null : _requests![index].id;
        }),
        onQuoteSent: () {
          setState(() => _expandedRequestId = null);
          _load();
        },
      ),
    );
  }
}

class _RequestCard extends StatelessWidget {
  const _RequestCard({
    required this.request,
    required this.isFormOpen,
    required this.onToggleForm,
    required this.onQuoteSent,
  });

  final ServiceRequestModel request;
  final bool isFormOpen;
  final VoidCallback onToggleForm;
  final VoidCallback onQuoteSent;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(border: Border.all(color: theme.dividerColor), borderRadius: BorderRadius.circular(16)),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(request.category.name, style: theme.textTheme.bodySmall?.copyWith(color: theme.colorScheme.primary)),
          const SizedBox(height: 4),
          Text(request.description, style: theme.textTheme.titleSmall, maxLines: 2, overflow: TextOverflow.ellipsis),
          const SizedBox(height: 8),
          Wrap(
            spacing: 8,
            runSpacing: 4,
            children: [
              AppBadge(label: request.location),
              AppBadge(label: _urgencyLabels[request.urgency] ?? request.urgency),
              if (request.budget != null) AppBadge(label: '${request.budget!.toStringAsFixed(0)} €'),
            ],
          ),
          const SizedBox(height: 12),
          if (request.myQuote != null)
            AppBadge(
              label: 'Já enviaste: ${request.myQuote!.price.toStringAsFixed(2)} €',
              variant: AppBadgeVariant.primary,
            )
          else if (isFormOpen)
            _SendQuoteForm(requestId: request.id, onSent: onQuoteSent)
          else
            OutlinedButton(onPressed: onToggleForm, child: const Text('Enviar orçamento')),
        ],
      ),
    );
  }
}

class _SendQuoteForm extends ConsumerStatefulWidget {
  const _SendQuoteForm({required this.requestId, required this.onSent});

  final String requestId;
  final VoidCallback onSent;

  @override
  ConsumerState<_SendQuoteForm> createState() => _SendQuoteFormState();
}

class _SendQuoteFormState extends ConsumerState<_SendQuoteForm> {
  final _priceController = TextEditingController();
  final _messageController = TextEditingController();
  bool _isSubmitting = false;

  @override
  void dispose() {
    _priceController.dispose();
    _messageController.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    final price = double.tryParse(_priceController.text.replaceAll(',', '.'));
    if (price == null || price <= 0) {
      showAppSnackBar(context, 'Indica um preço válido.', isError: true);
      return;
    }

    setState(() => _isSubmitting = true);
    final result = await ref.read(quotesRepositoryProvider).createQuote(
          serviceRequestId: widget.requestId,
          price: price,
          message: _messageController.text.trim().isEmpty ? null : _messageController.text.trim(),
        );
    if (!mounted) return;
    setState(() => _isSubmitting = false);

    switch (result) {
      case Ok():
        widget.onSent();
      case Err(:final failure):
        showAppSnackBar(context, failure.message, isError: true);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        TextField(
          controller: _priceController,
          keyboardType: const TextInputType.numberWithOptions(decimal: true),
          decoration: const InputDecoration(labelText: 'Preço (€)'),
        ),
        const SizedBox(height: 8),
        TextField(
          controller: _messageController,
          decoration: const InputDecoration(labelText: 'Mensagem (opcional)', hintText: 'Prazo, condições...'),
        ),
        const SizedBox(height: 12),
        ElevatedButton(
          onPressed: _isSubmitting ? null : _submit,
          child: Text(_isSubmitting ? 'A enviar…' : 'Enviar'),
        ),
      ],
    );
  }
}
