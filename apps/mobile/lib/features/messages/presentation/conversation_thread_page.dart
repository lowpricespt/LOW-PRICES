import 'dart:async';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/utils/result.dart';
import '../../../models/message.dart';
import '../../../providers/app_providers.dart';
import '../../../shared/widgets/app_error_state.dart';
import '../../../shared/widgets/app_skeleton.dart';

const _pollInterval = Duration(seconds: 5);

class ConversationThreadPage extends ConsumerStatefulWidget {
  const ConversationThreadPage({super.key, required this.quoteId, this.otherPartyName});

  final String quoteId;
  final String? otherPartyName;

  @override
  ConsumerState<ConversationThreadPage> createState() => _ConversationThreadPageState();
}

class _ConversationThreadPageState extends ConsumerState<ConversationThreadPage> {
  List<MessageModel>? _messages;
  bool _hasError = false;
  bool _isSending = false;
  final _draftController = TextEditingController();
  final _scrollController = ScrollController();
  Timer? _pollTimer;

  @override
  void initState() {
    super.initState();
    _load();
    // Sem WebSocket nesta fase — polling simples, mesmo padrão do
    // website (`ConversationThread` em `conversations-section.tsx`).
    _pollTimer = Timer.periodic(_pollInterval, (_) => _load());
  }

  @override
  void dispose() {
    _pollTimer?.cancel();
    _draftController.dispose();
    _scrollController.dispose();
    super.dispose();
  }

  Future<void> _load() async {
    final result = await ref.read(messagesRepositoryProvider).fetchMessages(widget.quoteId);
    if (!mounted) return;
    switch (result) {
      case Ok(:final value):
        setState(() {
          _messages = value;
          _hasError = false;
        });
        WidgetsBinding.instance.addPostFrameCallback((_) => _scrollToBottom());
      case Err():
        setState(() => _hasError = true);
    }
  }

  void _scrollToBottom() {
    if (!_scrollController.hasClients) return;
    _scrollController.animateTo(
      _scrollController.position.maxScrollExtent,
      duration: const Duration(milliseconds: 200),
      curve: Curves.easeOut,
    );
  }

  Future<void> _send() async {
    final body = _draftController.text.trim();
    if (body.isEmpty) return;
    setState(() => _isSending = true);
    final result = await ref.read(messagesRepositoryProvider).sendMessage(widget.quoteId, body);
    if (!mounted) return;
    setState(() => _isSending = false);
    switch (result) {
      case Ok():
        _draftController.clear();
        await _load();
      case Err():
        setState(() => _hasError = true);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text(widget.otherPartyName ?? 'Conversa')),
      body: Column(
        children: [
          Expanded(child: _buildMessages()),
          _buildComposer(),
        ],
      ),
    );
  }

  Widget _buildMessages() {
    if (_hasError && _messages == null) {
      return AppErrorState(onRetry: _load, description: 'Não foi possível carregar as mensagens.');
    }
    if (_messages == null) {
      return ListView(
        padding: const EdgeInsets.all(16),
        children: List.generate(
          4,
          (index) => Padding(
            padding: const EdgeInsets.only(bottom: 12),
            child: Align(
              alignment: index.isEven ? Alignment.centerLeft : Alignment.centerRight,
              child: const AppSkeleton(width: 180, height: 40, borderRadius: 12),
            ),
          ),
        ),
      );
    }
    if (_messages!.isEmpty) {
      return Center(
        child: Text('Ainda não há mensagens — diz olá.', style: Theme.of(context).textTheme.bodyMedium),
      );
    }
    return ListView.builder(
      controller: _scrollController,
      padding: const EdgeInsets.all(16),
      itemCount: _messages!.length,
      itemBuilder: (context, index) => _MessageBubble(message: _messages![index]),
    );
  }

  Widget _buildComposer() {
    final theme = Theme.of(context);
    return SafeArea(
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
        decoration: BoxDecoration(border: Border(top: BorderSide(color: theme.dividerColor))),
        child: Row(
          children: [
            Expanded(
              child: TextField(
                controller: _draftController,
                decoration: const InputDecoration(hintText: 'Escreve uma mensagem...'),
                textInputAction: TextInputAction.send,
                onSubmitted: (_) => _send(),
              ),
            ),
            const SizedBox(width: 8),
            IconButton(
              onPressed: _isSending ? null : _send,
              icon: _isSending
                  ? const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(strokeWidth: 2))
                  : const Icon(Icons.send),
            ),
          ],
        ),
      ),
    );
  }
}

class _MessageBubble extends StatelessWidget {
  const _MessageBubble({required this.message});

  final MessageModel message;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isMine = message.isMine;
    return Align(
      alignment: isMine ? Alignment.centerRight : Alignment.centerLeft,
      child: Container(
        margin: const EdgeInsets.only(bottom: 10),
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
        constraints: BoxConstraints(maxWidth: MediaQuery.of(context).size.width * 0.75),
        decoration: BoxDecoration(
          color: isMine ? theme.colorScheme.primary : theme.colorScheme.surface,
          borderRadius: BorderRadius.circular(14),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          mainAxisSize: MainAxisSize.min,
          children: [
            Text(
              message.body,
              style: theme.textTheme.bodyMedium?.copyWith(
                color: isMine ? theme.colorScheme.onPrimary : theme.colorScheme.onSurface,
              ),
            ),
            const SizedBox(height: 4),
            Text(
              _formatTime(message.createdAt),
              style: theme.textTheme.bodySmall?.copyWith(
                color: (isMine ? theme.colorScheme.onPrimary : theme.colorScheme.onSurface).withValues(alpha: 0.7),
              ),
            ),
          ],
        ),
      ),
    );
  }

  String _formatTime(DateTime dateTime) {
    final local = dateTime.toLocal();
    final hour = local.hour.toString().padLeft(2, '0');
    final minute = local.minute.toString().padLeft(2, '0');
    return '${local.day.toString().padLeft(2, '0')}/${local.month.toString().padLeft(2, '0')} $hour:$minute';
  }
}
