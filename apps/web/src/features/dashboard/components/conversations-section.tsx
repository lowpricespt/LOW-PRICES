'use client';

import { useEffect, useRef, useState } from 'react';
import { MessageCircle, Send } from 'lucide-react';
import { Badge, Button, Card, EmptyState, ErrorState, Input, Skeleton } from '@/components/ui';
import {
  fetchMyConversations,
  fetchMessages,
  sendMessage,
  type Conversation,
  type Message,
} from '@/features/dashboard/services/messages-api';

const POLL_INTERVAL_MS = 5000;

function ConversationThread({ jobId }: { jobId: string }) {
  const [messages, setMessages] = useState<Message[] | null>(null);
  const [error, setError] = useState(false);
  const [draft, setDraft] = useState('');
  const [isSending, setIsSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  function load() {
    fetchMessages(jobId)
      .then(setMessages)
      .catch(() => setError(true));
  }

  useEffect(() => {
    load();
    // Sem WebSocket nesta fase — polling simples a cada 5s enquanto a
    // conversa está aberta é suficiente para o volume do piloto e evita
    // depender de infraestrutura extra (Redis pub-sub) antes de ter tráfego
    // real que a justifique.
    const interval = setInterval(load, POLL_INTERVAL_MS);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [jobId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ block: 'end' });
  }, [messages]);

  async function handleSend(event: React.FormEvent) {
    event.preventDefault();
    if (!draft.trim()) return;
    setIsSending(true);
    try {
      await sendMessage(jobId, draft.trim());
      setDraft('');
      load();
    } catch {
      setError(true);
    } finally {
      setIsSending(false);
    }
  }

  if (error) return <ErrorState onRetry={load} />;
  if (messages === null) return <Skeleton className="h-40 w-full rounded-lg" />;

  return (
    <div className="mt-3">
      <div className="max-h-80 space-y-2 overflow-y-auto rounded-lg border border-border bg-secondary/30 p-3">
        {messages.length === 0 ? (
          <p className="text-center text-sm text-muted-foreground">Ainda não há mensagens — diz olá.</p>
        ) : (
          messages.map((message) => (
            <div key={message.id} className={`flex ${message.isMine ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`max-w-[75%] rounded-lg px-3 py-2 text-sm ${
                  message.isMine ? 'bg-primary text-primary-foreground' : 'bg-background'
                }`}
              >
                <p>{message.body}</p>
                <p className={`mt-1 text-[10px] ${message.isMine ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>
                  {new Date(message.createdAt).toLocaleString('pt-PT', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          ))
        )}
        <div ref={bottomRef} />
      </div>

      <form onSubmit={handleSend} className="mt-2 flex gap-2">
        <Input
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          placeholder="Escreve uma mensagem..."
          className="flex-1"
        />
        <Button type="submit" size="icon" disabled={isSending || !draft.trim()} aria-label="Enviar">
          <Send className="size-4" />
        </Button>
      </form>
    </div>
  );
}

export function ConversationsSection() {
  const [conversations, setConversations] = useState<Conversation[] | null>(null);
  const [error, setError] = useState(false);
  const [openJobId, setOpenJobId] = useState<string | null>(null);

  function load() {
    fetchMyConversations()
      .then(setConversations)
      .catch(() => setError(true));
  }

  useEffect(load, []);

  if (error) return <ErrorState onRetry={load} />;
  if (conversations === null) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-16 w-full rounded-xl" />
        <Skeleton className="h-16 w-full rounded-xl" />
      </div>
    );
  }
  if (conversations.length === 0) {
    return (
      <EmptyState
        icon={MessageCircle}
        title="Ainda sem conversas"
        description="As conversas aparecem aqui assim que tiveres um trabalho com orçamento aceite."
      />
    );
  }

  return (
    <div className="space-y-3">
      {conversations.map((conversation) => (
        <Card key={conversation.jobId} className="p-4">
          <button
            type="button"
            onClick={() => setOpenJobId(openJobId === conversation.jobId ? null : conversation.jobId)}
            className="flex w-full items-center justify-between gap-3 text-left"
          >
            <div>
              <p className="font-medium">{conversation.otherPartyName}</p>
              <p className="text-sm text-muted-foreground">{conversation.serviceRequestTitle}</p>
            </div>
            {conversation.unreadCount > 0 && (
              <Badge>{conversation.unreadCount} nova{conversation.unreadCount === 1 ? '' : 's'}</Badge>
            )}
          </button>

          {openJobId === conversation.jobId && <ConversationThread jobId={conversation.jobId} />}
        </Card>
      ))}
    </div>
  );
}
