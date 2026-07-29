'use client';

import { useEffect, useState } from 'react';
import { CalendarDays, Trash2 } from 'lucide-react';
import { Card, Skeleton, ErrorState, EmptyState, Button, Input } from '@/components/ui';
import { DashboardPageHeader } from '@/features/dashboard/components/page-header';
import { AgendaCalendar } from '@/features/dashboard/components/agenda-calendar';
import {
  fetchAvailabilityBlocks,
  createAvailabilityBlock,
  deleteAvailabilityBlock,
  type AvailabilityBlock,
} from '@/features/dashboard/services/availability-api';
import { fetchMyJobs, scheduleJob, type Job } from '@/features/dashboard/services/jobs-api';
import type { ApiError } from '@/services/api';

function formatDate(value: string): string {
  return new Date(value).toLocaleDateString('pt-PT', { day: '2-digit', month: 'short', year: 'numeric' });
}

/// Converte o valor de um <input type="datetime-local"> (hora local, sem
/// timezone) para ISO — evita o desvio de fuso horário que ocorreria ao
/// tratar a string como UTC diretamente.
function localDateTimeToIso(value: string): string {
  return new Date(value).toISOString();
}

function ScheduleJobForm({ job, onScheduled }: { job: Job; onScheduled: () => void }) {
  const [start, setStart] = useState('');
  const [end, setEnd] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    if (!start || !end) {
      setError('Indica a data/hora de início e de fim.');
      return;
    }
    setIsSubmitting(true);
    try {
      await scheduleJob(job.id, localDateTimeToIso(start), localDateTimeToIso(end));
      onScheduled();
    } catch (err) {
      setError((err as ApiError).message ?? 'Não foi possível agendar este trabalho.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-3 grid gap-3 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
      <div>
        <label className="text-xs text-muted-foreground">Início</label>
        <input
          type="datetime-local"
          value={start}
          onChange={(event) => setStart(event.target.value)}
          className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
        />
      </div>
      <div>
        <label className="text-xs text-muted-foreground">Fim</label>
        <input
          type="datetime-local"
          value={end}
          onChange={(event) => setEnd(event.target.value)}
          className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
        />
      </div>
      <Button type="submit" size="sm" disabled={isSubmitting}>
        {isSubmitting ? 'A agendar…' : 'Agendar'}
      </Button>
      {error ? <p className="text-sm text-destructive sm:col-span-3">{error}</p> : null}
    </form>
  );
}

// Inclui "Calendário" como vista dentro desta mesma página (ver
// docs/architecture/AGENDA_ARCHITECTURE.md) — não é uma rota à parte.
export default function ProfessionalAgendaPage() {
  const [blocks, setBlocks] = useState<AvailabilityBlock[] | null>(null);
  const [jobs, setJobs] = useState<Job[] | null>(null);
  const [error, setError] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reason, setReason] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  function load() {
    Promise.all([fetchAvailabilityBlocks(), fetchMyJobs()])
      .then(([blocksResult, jobsResult]) => {
        setBlocks(blocksResult);
        setJobs(jobsResult);
      })
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

  const unscheduledJobs = (jobs ?? []).filter(
    (job) => !job.scheduledStart && ['SCHEDULED', 'IN_PROGRESS'].includes(job.status),
  );

  return (
    <div>
      <DashboardPageHeader title="Agenda" description="O teu calendário, trabalhos agendados e períodos de indisponibilidade." />

      {error ? (
        <ErrorState onRetry={load} />
      ) : blocks === null || jobs === null ? (
        <div className="space-y-3">
          <Skeleton className="h-64 w-full rounded-xl" />
        </div>
      ) : (
        <>
          <Card className="p-4">
            <AgendaCalendar blocks={blocks} jobs={jobs} />
          </Card>

          {unscheduledJobs.length > 0 && (
            <Card className="mt-4 p-4">
              <p className="text-sm font-medium">Trabalhos aceites por agendar</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Define data e hora para apareceram no calendário acima e no teu cliente.
              </p>
              <div className="mt-3 space-y-4">
                {unscheduledJobs.map((job) => (
                  <div key={job.id} className="rounded-lg border border-border p-3">
                    <p className="text-sm font-medium">{job.serviceRequestTitle}</p>
                    <p className="text-xs text-muted-foreground">Cliente: {job.otherParty.name}</p>
                    <ScheduleJobForm job={job} onScheduled={load} />
                  </div>
                ))}
              </div>
            </Card>
          )}

          <Card className="mt-4 p-4">
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
                <Input
                  value={reason}
                  onChange={(event) => setReason(event.target.value)}
                  placeholder="Ex: Férias"
                />
              </div>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'A criar…' : 'Adicionar'}
              </Button>
            </form>
            {formError && <p className="mt-2 text-sm text-destructive">{formError}</p>}
          </Card>

          <div className="mt-4">
            {blocks.length === 0 ? (
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
        </>
      )}
    </div>
  );
}
