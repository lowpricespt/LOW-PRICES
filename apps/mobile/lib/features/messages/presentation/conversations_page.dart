import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../core/utils/result.dart';
import '../../../models/message.dart';
import '../../../providers/app_providers.dart';
import '../../../shared/widgets/app_badge.dart';
import '../../../shared/widgets/app_empty_state.dart';
import '../../../shared/widgets/app_error_state.dart';
import '../../../shared/widgets/app_skeleton.dart';

class ConversationsPage extends ConsumerStatefulWidget {
  const ConversationsPage({super.key});

  @override
  ConsumerState<ConversationsPage> createState() => _ConversationsPageState();
}

class _ConversationsPageState extends ConsumerState<ConversationsPage> {
  List<ConversationModel>? _conversations;
  bool _hasError = false;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    setState(() => _hasError = false);
    final result = await ref.read(messagesRepositoryProvider).fetchMyConversations();
    if (!mounted) return;
    switch (result) {
      case Ok(:final value):
        setState(() => _conversations = value);
      case Err():
        setState(() => _hasError = true);
    }
  }

  @override
  Widget build(BuildContext context) {
    // Recarrega sempre que este separador (índice 2 no dashboard do
    // cliente) volta a ficar visível — ver nota em
    // `dashboardTabIndexProvider`.
    ref.listen<int>(dashboardTabIndexProvider, (previous, next) {
      if (next == 2 && previous != 2) _load();
    });

    return Scaffold(
      appBar: AppBar(title: const Text('Conversas')),
      body: RefreshIndicator(onRefresh: _load, child: _buildBody()),
    );
  }

  Widget _buildBody() {
    if (_hasError) {
      return ListView(
        children: [AppErrorState(onRetry: _load, description: 'Não foi possível carregar as conversas.')],
      );
    }
    if (_conversations == null) {
      return ListView(
        padding: const EdgeInsets.all(16),
        children: List.generate(
          3,
          (index) => const Padding(
            padding: EdgeInsets.only(bottom: 12),
            child: AppSkeleton(height: 72, borderRadius: 16),
          ),
        ),
      );
    }
    if (_conversations!.isEmpty) {
      return const AppEmptyState(
        icon: Icons.chat_bubble_outline,
        title: 'Ainda sem conversas',
        description: 'As conversas aparecem aqui assim que um orçamento for enviado ou recebido num pedido.',
      );
    }
    return ListView.separated(
      padding: const EdgeInsets.all(16),
      itemCount: _conversations!.length,
      separatorBuilder: (_, __) => const SizedBox(height: 12),
      itemBuilder: (context, index) {
        final conversation = _conversations![index];
        return _ConversationTile(
          conversation: conversation,
          onTap: () async {
            await context.push('/mensagens/${conversation.quoteId}', extra: conversation.otherPartyName);
            _load();
          },
        );
      },
    );
  }
}

class _ConversationTile extends StatelessWidget {
  const _ConversationTile({required this.conversation, required this.onTap});

  final ConversationModel conversation;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(16),
      child: Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(border: Border.all(color: theme.dividerColor), borderRadius: BorderRadius.circular(16)),
        child: Row(
          children: [
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(conversation.otherPartyName, style: theme.textTheme.titleSmall),
                  const SizedBox(height: 2),
                  Text(
                    conversation.serviceRequestTitle,
                    style: theme.textTheme.bodySmall,
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                ],
              ),
            ),
            if (conversation.unreadCount > 0)
              AppBadge(label: '${conversation.unreadCount} nova${conversation.unreadCount == 1 ? '' : 's'}', variant: AppBadgeVariant.primary),
          ],
        ),
      ),
    );
  }
}
