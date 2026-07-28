'use client';

import { useEffect, useState } from 'react';
import { Wallet } from 'lucide-react';
import { Card, Skeleton, ErrorState } from '@/components/ui';
import { DashboardPageHeader } from '@/features/dashboard/components/page-header';
import { fetchEarnings, type EarningsSummary } from '@/features/dashboard/services/earnings-api';

function formatEuros(value: number): string {
  return value.toLocaleString('pt-PT', { style: 'currency', currency: 'EUR' });
}

export default function ProfessionalEarningsPage() {
  const [summary, setSummary] = useState<EarningsSummary | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetchEarnings()
      .then(setSummary)
      .catch(() => setError(true));
  }, []);

  return (
    <div>
      <DashboardPageHeader title="Ganhos" description="Resumo dos valores acordados em trabalhos concluídos." />

      {error ? (
        <ErrorState onRetry={() => window.location.reload()} />
      ) : summary === null ? (
        <div className="grid gap-4 sm:grid-cols-2">
          <Skeleton className="h-32 w-full rounded-xl" />
          <Skeleton className="h-32 w-full rounded-xl" />
        </div>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2">
            <Card className="p-6">
              <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <Wallet className="size-4" />
                Este mês
              </div>
              <p className="mt-3 font-display text-3xl font-semibold">{formatEuros(summary.currentMonthEarned)}</p>
              <p className="mt-1 text-sm text-muted-foreground">
                {summary.currentMonthJobsCount} trabalho{summary.currentMonthJobsCount === 1 ? '' : 's'} concluído
                {summary.currentMonthJobsCount === 1 ? '' : 's'}
              </p>
            </Card>

            <Card className="p-6">
              <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <Wallet className="size-4" />
                Total acumulado
              </div>
              <p className="mt-3 font-display text-3xl font-semibold">{formatEuros(summary.totalEarned)}</p>
              <p className="mt-1 text-sm text-muted-foreground">
                {summary.completedJobsCount} trabalho{summary.completedJobsCount === 1 ? '' : 's'} concluído
                {summary.completedJobsCount === 1 ? '' : 's'} no total
              </p>
            </Card>
          </div>

          <p className="mt-4 text-xs text-muted-foreground">{summary.note}</p>
        </>
      )}
    </div>
  );
}
