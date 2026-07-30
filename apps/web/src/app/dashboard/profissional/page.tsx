'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Inbox } from 'lucide-react';
import { Button, Card, EmptyState, ErrorState, Skeleton } from '@/components/ui';
import { DashboardPageHeader } from '@/features/dashboard/components/page-header';
import { RequestCard } from '@/features/dashboard/components/request-card';
import { fetchAvailableServiceRequests, type ServiceRequest } from '@/features/request-service/services/requests-api';
import { fetchMyJobs, type Job } from '@/features/dashboard/services/jobs-api';
import { fetchMyReviews } from '@/features/dashboard/services/reviews-api';

const RECENT_COUNT = 3;

function getMonday(date: Date): Date {
  const clone = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const day = clone.getDay(); // 0 = domingo .. 6 = sábado
  const diff = day === 0 ? -6 : 1 - day;
  clone.setDate(clone.getDate() + diff);
  return clone;
}

export default function ProfessionalDashboardHomePage() {
  const [requests, setRequests] = useState<ServiceRequest[] | null>(null);
  const [jobs, setJobs] = useState<Job[] | null>(null);
  const [averageRating, setAverageRating] = useState<number | null>(null);
  const [error, setError] = useState(false);

  function load() {
    fetchAvailableServiceRequests({ pageSize: 50 })
      .then((result) => setRequests(result.items))
      .catch(() => setError(true));
  }

  useEffect(load, []);
  useEffect(() => {
    fetchMyJobs()
      .then(setJobs)
      .catch(() => {
        // Os cartões de trabalhos/avaliação são um extra sobre os pedidos
        // disponíveis — se falharem, a página continua utilizável.
      });
    fetchMyReviews()
      .then((summary) => setAverageRating(summary.average))
      .catch(() => {});
  }, []);

  const monday = getMonday(new Date());
  const nextMonday = new Date(monday);
  nextMonday.setDate(monday.getDate() + 7);
  const jobsThisWeek =
    jobs?.filter((job) => {
      if (!job.scheduledStart || !['SCHEDULED', 'IN_PROGRESS'].includes(job.status)) return false;
      const start = new Date(job.scheduledStart);
      return start >= monday && start < nextMonday;
    }).length ?? null;

  const recent = requests?.slice(0, RECENT_COUNT) ?? [];

  return (
    <div>
      <DashboardPageHeader title="Olá!" description="Aqui está um resumo da tua atividade." />

      <div className="mb-8 grid gap-4 sm:grid-cols-3">
        <Card className="p-4">
          <p className="text-xs text-muted-foreground">Pedidos disponíveis</p>
          <p className="mt-1 font-display text-2xl font-semibold">{requests === null ? '—' : requests.length}</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs text-muted-foreground">Trabalhos esta semana</p>
          <p className="mt-1 font-display text-2xl font-semibold">{jobsThisWeek ?? '—'}</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs text-muted-foreground">Avaliação média</p>
          <p className="mt-1 font-display text-2xl font-semibold">
            {averageRating === null ? '—' : averageRating.toFixed(1)}
          </p>
        </Card>
      </div>

      {error ? (
        <ErrorState onRetry={load} />
      ) : requests === null ? (
        <div className="space-y-3">
          {Array.from({ length: 2 }).map((_, index) => (
            <Skeleton key={index} className="h-24 w-full rounded-xl" />
          ))}
        </div>
      ) : recent.length === 0 ? (
        <EmptyState
          icon={Inbox}
          title="Ainda não há pedidos disponíveis"
          description="Assim que aparecer um pedido compatível com as tuas categorias e zona, aparece aqui."
        />
      ) : (
        <div className="space-y-3">
          {recent.map((request) => (
            <RequestCard key={request.id} request={request} />
          ))}
          <div className="flex justify-center pt-1">
            <Button variant="outline" size="sm" asChild>
              <Link href="/dashboard/profissional/pedidos-disponiveis">Ver todos os pedidos disponíveis</Link>
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
