'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ClipboardList } from 'lucide-react';
import { Button, Card, EmptyState, ErrorState, Skeleton } from '@/components/ui';
import { DashboardPageHeader } from '@/features/dashboard/components/page-header';
import { RequestCard } from '@/features/dashboard/components/request-card';
import { fetchMyServiceRequests, type ServiceRequest } from '@/features/request-service/services/requests-api';

const RECENT_COUNT = 3;

export default function ClientDashboardHomePage() {
  const [requests, setRequests] = useState<ServiceRequest[] | null>(null);
  const [error, setError] = useState(false);

  function load() {
    fetchMyServiceRequests({ pageSize: 50 })
      .then((result) => setRequests(result.items))
      .catch(() => setError(true));
  }

  useEffect(load, []);

  const activeCount = requests?.filter((request) => ['PUBLISHED', 'IN_NEGOTIATION', 'SCHEDULED'].includes(request.status)).length ?? 0;
  const pendingReviewCount = requests?.filter((request) => request.status === 'IN_NEGOTIATION').length ?? 0;
  const completedCount = requests?.filter((request) => request.status === 'COMPLETED').length ?? 0;
  const recent = [...(requests ?? [])]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, RECENT_COUNT);

  return (
    <div>
      <DashboardPageHeader
        title="Olá!"
        description="Aqui está um resumo da tua atividade."
        action={
          <Button asChild>
            <Link href="/pedir-servico">Novo pedido</Link>
          </Button>
        }
      />

      <div className="mb-8 grid gap-4 sm:grid-cols-3">
        <Card className="p-4">
          <p className="text-xs text-muted-foreground">Pedidos ativos</p>
          <p className="mt-1 font-display text-2xl font-semibold">{requests === null ? '—' : activeCount}</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs text-muted-foreground">Orçamentos por rever</p>
          <p className="mt-1 font-display text-2xl font-semibold">{requests === null ? '—' : pendingReviewCount}</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs text-muted-foreground">Trabalhos concluídos</p>
          <p className="mt-1 font-display text-2xl font-semibold">{requests === null ? '—' : completedCount}</p>
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
          icon={ClipboardList}
          title="Ainda não tens pedidos"
          description="Quando pedires um serviço, ele aparece aqui."
          action={
            <Button asChild size="sm">
              <Link href="/pedir-servico">Pedir um serviço</Link>
            </Button>
          }
        />
      ) : (
        <div className="space-y-3">
          {recent.map((request) => (
            <RequestCard key={request.id} request={request} />
          ))}
          <div className="flex justify-center pt-1">
            <Button variant="outline" size="sm" asChild>
              <Link href="/dashboard/cliente/pedidos">Ver todos os pedidos</Link>
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
