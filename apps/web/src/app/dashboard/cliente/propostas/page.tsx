'use client';

import { useEffect, useState } from 'react';
import { Inbox, ChevronDown, ChevronUp, Heart } from 'lucide-react';
import { Badge, Button, Card, EmptyState, ErrorState, Skeleton } from '@/components/ui';
import { DashboardPageHeader } from '@/features/dashboard/components/page-header';
import { QUOTE_STATUS_LABELS, QUOTE_STATUS_VARIANT } from '@/features/dashboard/status-maps';
import { fetchMyServiceRequests, type ServiceRequest } from '@/features/request-service/services/requests-api';
import { fetchQuotesForRequest, acceptQuote, rejectQuote, type Quote } from '@/features/dashboard/services/quotes-api';
import { fetchMyFavorites, addFavorite, removeFavorite } from '@/features/dashboard/services/favorites-api';

function QuoteRow({
  quote,
  onRespond,
  isFavorited,
  onToggleFavorite,
}: {
  quote: Quote;
  onRespond: () => void;
  isFavorited: boolean;
  onToggleFavorite: () => void;
}) {
  const [isSubmitting, setIsSubmitting] = useState<'accept' | 'reject' | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleAccept() {
    setError(null);
    setIsSubmitting('accept');
    try {
      await acceptQuote(quote.id);
      onRespond();
    } catch {
      setError('Não foi possível aceitar este orçamento.');
      setIsSubmitting(null);
    }
  }

  async function handleReject() {
    setError(null);
    setIsSubmitting('reject');
    try {
      await rejectQuote(quote.id);
      onRespond();
    } catch {
      setError('Não foi possível rejeitar este orçamento.');
      setIsSubmitting(null);
    }
  }

  return (
    <div className="rounded-lg border border-border p-3">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <p className="font-medium">{quote.professional.name}</p>
            <button
              type="button"
              onClick={onToggleFavorite}
              aria-label={isFavorited ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
              className="text-muted-foreground hover:text-destructive"
            >
              <Heart className={`size-4 ${isFavorited ? 'fill-destructive text-destructive' : ''}`} />
            </button>
          </div>
          <p className="mt-0.5 text-lg font-semibold">
            {quote.price.toLocaleString('pt-PT', { style: 'currency', currency: 'EUR' })}
          </p>
          {quote.message && <p className="mt-1 text-sm text-muted-foreground">&quot;{quote.message}&quot;</p>}
        </div>
        <Badge variant={QUOTE_STATUS_VARIANT[quote.status] ?? 'secondary'}>
          {QUOTE_STATUS_LABELS[quote.status] ?? quote.status}
        </Badge>
      </div>

      {error && <p className="mt-2 text-sm text-destructive">{error}</p>}

      {quote.status === 'SENT' && (
        <div className="mt-3 flex gap-2">
          <Button size="sm" disabled={isSubmitting !== null} onClick={handleAccept}>
            {isSubmitting === 'accept' ? 'A aceitar…' : 'Aceitar'}
          </Button>
          <Button size="sm" variant="outline" disabled={isSubmitting !== null} onClick={handleReject}>
            {isSubmitting === 'reject' ? 'A rejeitar…' : 'Rejeitar'}
          </Button>
        </div>
      )}
    </div>
  );
}

function RequestWithQuotes({
  request,
  onChanged,
  favoritedIds,
  onToggleFavorite,
}: {
  request: ServiceRequest;
  onChanged: () => void;
  favoritedIds: Set<string>;
  onToggleFavorite: (professionalProfileId: string) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [quotes, setQuotes] = useState<Quote[] | null>(null);
  const [error, setError] = useState(false);

  function load() {
    fetchQuotesForRequest(request.id)
      .then(setQuotes)
      .catch(() => setError(true));
  }

  function toggle() {
    const next = !isOpen;
    setIsOpen(next);
    if (next && quotes === null) load();
  }

  return (
    <Card className="p-4">
      <button type="button" onClick={toggle} className="flex w-full items-start justify-between gap-3 text-left">
        <div>
          <p className="text-xs font-medium text-muted-foreground">{request.category.name}</p>
          <h3 className="mt-0.5 font-medium">
            {request.description.length > 80 ? `${request.description.slice(0, 80)}…` : request.description}
          </h3>
          <p className="mt-1 text-xs text-muted-foreground">
            {request.quotesCount} orçamento{request.quotesCount === 1 ? '' : 's'} recebido
            {request.quotesCount === 1 ? '' : 's'}
          </p>
        </div>
        {isOpen ? <ChevronUp className="size-4 shrink-0" /> : <ChevronDown className="size-4 shrink-0" />}
      </button>

      {isOpen && (
        <div className="mt-4 space-y-2">
          {error ? (
            <ErrorState onRetry={load} />
          ) : quotes === null ? (
            <Skeleton className="h-16 w-full rounded-lg" />
          ) : quotes.length === 0 ? (
            <p className="text-sm text-muted-foreground">Ainda não há orçamentos para este pedido.</p>
          ) : (
            quotes.map((quote) => (
              <QuoteRow
                key={quote.id}
                quote={quote}
                onRespond={() => {
                  load();
                  onChanged();
                }}
                isFavorited={favoritedIds.has(quote.professional.professionalProfileId)}
                onToggleFavorite={() => onToggleFavorite(quote.professional.professionalProfileId)}
              />
            ))
          )}
        </div>
      )}
    </Card>
  );
}

export default function ClientQuotesPage() {
  const [requests, setRequests] = useState<ServiceRequest[] | null>(null);
  const [error, setError] = useState(false);
  const [favoritedIds, setFavoritedIds] = useState<Set<string>>(new Set());

  function load() {
    fetchMyServiceRequests({ pageSize: 50 })
      .then((result) => setRequests(result.items.filter((request) => (request.quotesCount ?? 0) > 0)))
      .catch(() => setError(true));
  }

  useEffect(load, []);
  useEffect(() => {
    fetchMyFavorites()
      .then((favorites) => setFavoritedIds(new Set(favorites.map((favorite) => favorite.professionalProfileId))))
      .catch(() => {
        // Não bloqueia a página de propostas — só o coração de favoritos
        // fica indisponível se isto falhar.
      });
  }, []);

  async function handleToggleFavorite(professionalProfileId: string) {
    const isCurrentlyFavorited = favoritedIds.has(professionalProfileId);
    // Otimista: a UI responde já, e reverte se o pedido falhar.
    setFavoritedIds((current) => {
      const next = new Set(current);
      if (isCurrentlyFavorited) next.delete(professionalProfileId);
      else next.add(professionalProfileId);
      return next;
    });
    try {
      if (isCurrentlyFavorited) await removeFavorite(professionalProfileId);
      else await addFavorite(professionalProfileId);
    } catch {
      setFavoritedIds((current) => {
        const next = new Set(current);
        if (isCurrentlyFavorited) next.add(professionalProfileId);
        else next.delete(professionalProfileId);
        return next;
      });
    }
  }

  return (
    <div>
      <DashboardPageHeader
        title="Propostas recebidas"
        description="Orçamentos enviados por profissionais aos teus pedidos."
      />

      {error ? (
        <ErrorState onRetry={load} />
      ) : requests === null ? (
        <div className="space-y-3">
          <Skeleton className="h-20 w-full rounded-xl" />
          <Skeleton className="h-20 w-full rounded-xl" />
        </div>
      ) : requests.length === 0 ? (
        <EmptyState
          icon={Inbox}
          title="Ainda sem propostas"
          description="Quando um profissional enviar um orçamento a um dos teus pedidos, aparece aqui."
        />
      ) : (
        <div className="space-y-3">
          {requests.map((request) => (
            <RequestWithQuotes
              key={request.id}
              request={request}
              onChanged={load}
              favoritedIds={favoritedIds}
              onToggleFavorite={handleToggleFavorite}
            />
          ))}
        </div>
      )}
    </div>
  );
}
