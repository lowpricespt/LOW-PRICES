'use client';

import { useEffect, useState } from 'react';
import { Mail, Phone } from 'lucide-react';
import { Card, EmptyState, Skeleton, ErrorState, Badge } from '@/components/ui';
import { DashboardPageHeader } from '@/features/dashboard/components/page-header';
import { fetchMyJobs, type Job } from '@/features/dashboard/services/jobs-api';

const STATUS_LABELS: Record<string, string> = {
  SCHEDULED: 'Agendado',
  IN_PROGRESS: 'Em execução',
  COMPLETED: 'Concluído',
  CANCELLED: 'Cancelado',
};

export default function ProfessionalAcceptedJobsPage() {
  const [jobs, setJobs] = useState<Job[] | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetchMyJobs()
      .then(setJobs)
      .catch(() => setError(true));
  }, []);

  return (
    <div>
      <DashboardPageHeader
        title="Trabalhos aceites"
        description="O contacto do cliente fica visível assim que aceitas o orçamento — coordena diretamente com ele."
      />

      {error ? (
        <ErrorState onRetry={() => window.location.reload()} />
      ) : jobs === null ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <Skeleton key={index} className="h-28 w-full rounded-xl" />
          ))}
        </div>
      ) : jobs.length === 0 ? (
        <EmptyState
          title="Ainda não tens trabalhos aceites"
          description="Assim que um cliente aceitar um dos teus orçamentos, aparece aqui — com o contacto dele já disponível."
        />
      ) : (
        <div className="space-y-3">
          {jobs.map((job) => (
            <Card key={job.id} className="p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-medium">{job.serviceRequestTitle}</p>
                  <p className="mt-0.5 text-sm text-muted-foreground">
                    {job.price.toLocaleString('pt-PT', { style: 'currency', currency: 'EUR' })}
                  </p>
                </div>
                <Badge variant="secondary">{STATUS_LABELS[job.status] ?? job.status}</Badge>
              </div>

              <div className="mt-4 rounded-lg border border-border bg-secondary/50 p-3">
                <p className="text-xs font-medium text-muted-foreground">Contacto do cliente</p>
                <p className="mt-1 font-medium">{job.otherParty.name}</p>
                <div className="mt-2 flex flex-wrap gap-4 text-sm">
                  <a href={`mailto:${job.otherParty.email}`} className="flex items-center gap-1.5 text-primary hover:underline">
                    <Mail className="size-3.5" />
                    {job.otherParty.email}
                  </a>
                  {job.otherParty.phone ? (
                    <a href={`tel:${job.otherParty.phone}`} className="flex items-center gap-1.5 text-primary hover:underline">
                      <Phone className="size-3.5" />
                      {job.otherParty.phone}
                    </a>
                  ) : null}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
