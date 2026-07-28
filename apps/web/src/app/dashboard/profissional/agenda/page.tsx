'use client';

import { useEffect, useState } from 'react';
import { CalendarDays, Trash2 } from 'lucide-react';
import { Card, Skeleton, ErrorState, EmptyState, Button } from '@/components/ui';
import { DashboardPageHeader } from '@/features/dashboard/components/page-header';
import {
  fetchAvailabilityBlocks,
  createAvailabilityBlock,
  deleteAvailabilityBlock,
  type AvailabilityBlock,
} from '@/features/dashboard/services/availability-api';

function formatDate(value: string): string {
  return new Date(value).toLocaleDateString('pt-PT', { day: '2-digit', month: 'short', year: 'numeric' });
}

// Inclui "Calendário" como vista dentro desta mesma página (ver
// docs/architecture/AGENDA_ARCHITECTURE.md) — não é uma rota à parte.
// Versão mínima: bloqueios de indisponibilidade (férias, folgas). Não é
// ainda o calendário semanal recorrente completo — ver nota no backend
// (AvailabilityService).
export default function ProfessionalAgendaPage() {
  const [blocks, setBlocks] = useState<AvailabilityBlock[] | null>(null);
  const [error, setError] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reason, setReason] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  function load() {
    fetchAvailabilityBlocks()
      .then(setBlocks)
      .catch(() => setError(true));
  }

  useEffect(load, []);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setFormError(null);

    if (!startDate || !endDate) {
      setFormError('Indica a data de início e de fim.');
      return;
    }
    if (endDate < startDate) {
      setFormError('A data de fim tem de ser igual ou posterior à data de início.');
      return;
    }

    setIsSubmitting(true);
    try {
      await createAvailabilityBlock({ startDate, endDate, reason: reason.trim() || undefined });
      setStartDate('');
      setEndDate('');
      setReason('');
      load();
    } catch {
      setFormError('Não foi possível criar o bloqueio. Tenta novamente.');
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDelete(id: string) {
    await deleteAvailabilityBlock(id).catch(() => setError(true));
    load();
  }

  return (
    <div>
      <DashboardPageHeader title="Agenda" description="Marca períodos em que não estás disponível para novos trabalhos." />

      <Card className="p-4">
        <p className="text-sm font-medium">Novo bloqueio de indisponibilidade</p>
        <form onSubmit={handleSubmit} className="mt-3 grid gap-3 sm:grid-cols-[1fr_1fr_1.5fr_auto] sm:items-end">
          <div>
            <label className="text-xs text-muted-foreground">Início</label>
            <input
              type="date"
              value={startDate}
              onChange={(event) => setStartDate(event.target.value)}
              className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="text-xs text-muted-foreground">Fim</label>
            <input
              type="date"
              value={endDate}
              onChange={(event) => setEndDate(event.target.value)}
              className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="text-xs text-muted-foreground">Motivo (opcional)</label>
            <input
              type="text"
              value={reason}
              onChange={(event) => setReason(event.target.value)}
              placeholder="Ex: Férias"
              className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
            />
          </div>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'A criar…' : 'Adicionar'}
          </Button>
        </form>
        {formError && <p className="mt-2 text-sm text-destructive">{formError}</p>}
      </Card>

      <div className="mt-4">
        {error ? (
          <ErrorState onRetry={() => window.location.reload()} />
        ) : blocks === null ? (
          <div className="space-y-3">
            <Skeleton className="h-16 w-full rounded-xl" />
            <Skeleton className="h-16 w-full rounded-xl" />
          </div>
        ) : blocks.length === 0 ? (
          <EmptyState
            icon={CalendarDays}
            title="Sem bloqueios"
            description="Ainda não marcaste nenhum período de indisponibilidade."
          />
        ) : (
          <div className="space-y-2">
            {blocks.map((block) => (
              <Card key={block.id} className="flex items-center justify-between p-4">
                <div>
                  <p className="text-sm font-medium">
                    {formatDate(block.startDate)} — {formatDate(block.endDate)}
                  </p>
                  {block.reason && <p className="text-sm text-muted-foreground">{block.reason}</p>}
                </div>
                <button
                  type="button"
                  onClick={() => handleDelete(block.id)}
                  className="text-muted-foreground hover:text-destructive"
                  aria-label="Remover bloqueio"
                >
                  <Trash2 className="size-4" />
                </button>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
