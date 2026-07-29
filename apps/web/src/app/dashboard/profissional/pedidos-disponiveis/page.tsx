'use client';

import { useEffect, useState } from 'react';
import { Inbox, ShieldAlert } from 'lucide-react';
import { Badge, Button, EmptyState, ErrorState, Input, Skeleton } from '@/components/ui';
import { DashboardPageHeader } from '@/features/dashboard/components/page-header';
import { RequestCard } from '@/features/dashboard/components/request-card';
import { QUOTE_STATUS_LABELS, URGENCY_LABELS } from '@/features/dashboard/status-maps';
import { fetchAvailableServiceRequests, type ServiceRequest } from '@/features/request-service/services/requests-api';
import { createQuote } from '@/features/dashboard/services/quotes-api';
import type { ApiError } from '@/services/api';

function SendQuoteForm({ requestId, onSent }: { requestId: string; onSent: () => void }) {
  const [price, setPrice] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    const numericPrice = Number(price);
    if (!numericPrice || numericPrice <= 0) {
      setError('Indica um preço válido.');
      return;
    }
    setIsSubmitting(true);
    try {
      await createQuote({ serviceRequestId: requestId, price: numericPrice, message: message.trim() || undefined });
      onSent();
    } catch (err) {
      setError((err as ApiError).message ?? 'Não foi possível enviar o orçamento.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-4 rounded-lg border border-border bg-secondary/50 p-3">
      <p className="text-sm font-medium">Enviar orçamento</p>
      <div className="mt-3 grid gap-3 sm:grid-cols-[140px_1fr_auto] sm:items-end">
        <div>
          <label className="mb-1.5 block text-xs text-muted-foreground">Preço (€)</label>
          <Input type="number" min={1} step="0.01" value={price} onChange={(event) => setPrice(event.target.value)} />
        </div>
        <div>
          <label className="mb-1.5 block text-xs text-muted-foreground">Mensagem (opcional)</label>
          <Input value={message} onChange={(event) => setMessage(event.target.value)} placeholder="Prazo, condições..." />
        </div>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'A enviar…' : 'Enviar'}
        </Button>
      </div>
      {error && <p className="mt-2 text-sm text-destructive">{error}</p>}
    </form>
  );
}

export default function ProfessionalAvailableRequestsPage() {
  const [requests, setRequests] = useState<ServiceRequest[] | null>(null);
  const [verificationStatus, setVerificationStatus] = useState<string | undefined>(undefined);
  const [error, setError] = useState(false);

  const [openFormId, setOpenFormId] = useState<string | null>(null);

  function load() {
    fetchAvailableServiceRequests({ pageSize: 50 })
      .then((result) => {
        setRequests(result.items);
        setVerificationStatus(result.verificationStatus);
      })
      .catch(() => setError(true));
  }

  useEffect(load, []);

  const isPendingVerification = verificationStatus === 'PENDING';
  const isRejected = verificationStatus === 'REJECTED';

  return (
    <div>
      <DashboardPageHeader
        title="Pedidos disponíveis"
        description="Pedidos compatíveis com as tuas categorias e zona."
      />

      {error ? (
        <ErrorState onRetry={load} />
      ) : requests === null ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <Skeleton key={index} className="h-28 w-full rounded-xl" />
          ))}
        </div>
      ) : isPendingVerification ? (
        <EmptyState
          icon={ShieldAlert}
          title="A tua conta está pendente de verificação"
          description="Assim que a equipa Low Prices aprovar o teu perfil (costuma demorar menos de 24 horas), os pedidos compatíveis com as tuas categorias começam a aparecer aqui."
        />
      ) : isRejected ? (
        <EmptyState
          icon={ShieldAlert}
          title="A tua conta não foi aprovada"
          description="Contacta o suporte da Low Prices para perceberes o motivo e como corrigir."
        />
      ) : requests.length === 0 ? (
        <EmptyState
          icon={Inbox}
          title="Sem pedidos disponíveis de momento"
          description="Assim que houver um pedido novo compatível com as tuas categorias, aparece aqui."
        />
      ) : (
        <div className="space-y-3">
          {requests.map((request) => (
            <RequestCard key={request.id} request={request}>
              <div className="mt-3 flex items-center gap-3 text-xs text-muted-foreground">
                <span>Urgência: {URGENCY_LABELS[request.urgency] ?? request.urgency}</span>
                {request.budget && <span>Orçamento indicado: {request.budget.toFixed(2)} €</span>}
              </div>

              {request.myQuote ? (
                <div className="mt-4 flex items-center gap-2 text-sm">
                  <Badge variant="secondary">
                    Já enviaste: {request.myQuote.price.toLocaleString('pt-PT', { style: 'currency', currency: 'EUR' })} ·{' '}
                    {QUOTE_STATUS_LABELS[request.myQuote.status] ?? request.myQuote.status}
                  </Badge>
                </div>
              ) : openFormId === request.id ? (
                <SendQuoteForm
                  requestId={request.id}
                  onSent={() => {
                    setOpenFormId(null);
                    load();
                  }}
                />
              ) : (
                <Button size="sm" className="mt-4" onClick={() => setOpenFormId(request.id)}>
                  Enviar orçamento
                </Button>
              )}
            </RequestCard>
          ))}
        </div>
      )}
    </div>
  );
}
