'use client';

import { useEffect, useState } from 'react';
import { History, Star } from 'lucide-react';
import { Card, EmptyState, Skeleton, ErrorState, Badge, Button } from '@/components/ui';
import { DashboardPageHeader } from '@/features/dashboard/components/page-header';
import { fetchMyJobs, type Job } from '@/features/dashboard/services/jobs-api';
import { submitReview } from '@/features/dashboard/services/reviews-api';

const STATUS_LABELS: Record<string, string> = {
  SCHEDULED: 'Agendado',
  IN_PROGRESS: 'Em execução',
  COMPLETED: 'Concluído',
  CANCELLED: 'Cancelado',
};

function ReviewForm({ jobId, onDone }: { jobId: string; onDone: () => void }) {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit() {
    setError(null);
    setIsSubmitting(true);
    try {
      await submitReview({ jobId, rating, comment: comment.trim() || undefined });
      onDone();
    } catch {
      setError('Não foi possível enviar a avaliação. Tenta novamente.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="mt-4 rounded-lg border border-border bg-secondary/50 p-3">
      <p className="text-sm font-medium">Como correu o trabalho?</p>
      <div className="mt-2 flex gap-1">
        {[1, 2, 3, 4, 5].map((value) => (
          <button key={value} type="button" onClick={() => setRating(value)}>
            <Star className={`size-6 ${value <= rating ? 'fill-primary text-primary' : 'text-border'}`} />
          </button>
        ))}
      </div>
      <textarea
        value={comment}
        onChange={(event) => setComment(event.target.value)}
        placeholder="Comentário (opcional)"
        rows={2}
        className="mt-3 w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
      />
      {error && <p className="mt-2 text-sm text-destructive">{error}</p>}
      <Button size="sm" className="mt-3" disabled={isSubmitting} onClick={handleSubmit}>
        {isSubmitting ? 'A enviar…' : 'Enviar avaliação'}
      </Button>
    </div>
  );
}

export default function ClientHistoryPage() {
  const [jobs, setJobs] = useState<Job[] | null>(null);
  const [error, setError] = useState(false);
  const [reviewingJobId, setReviewingJobId] = useState<string | null>(null);

  function load() {
    fetchMyJobs()
      .then((all) => setJobs(all.filter((job) => job.status === 'COMPLETED' || job.status === 'CANCELLED')))
      .catch(() => setError(true));
  }

  useEffect(load, []);

  return (
    <div>
      <DashboardPageHeader title="Histórico" description="Todos os trabalhos já concluídos ou cancelados." />

      {error ? (
        <ErrorState onRetry={() => window.location.reload()} />
      ) : jobs === null ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <Skeleton key={index} className="h-24 w-full rounded-xl" />
          ))}
        </div>
      ) : jobs.length === 0 ? (
        <EmptyState
          icon={History}
          title="Ainda não tens histórico"
          description="Os trabalhos concluídos ou cancelados aparecem aqui."
        />
      ) : (
        <div className="space-y-3">
          {jobs.map((job) => (
            <Card key={job.id} className="p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-medium">{job.serviceRequestTitle}</p>
                  <p className="mt-0.5 text-sm text-muted-foreground">
                    {job.price.toLocaleString('pt-PT', { style: 'currency', currency: 'EUR' })} ·{' '}
                    {job.otherParty.name}
                  </p>
                </div>
                <Badge variant="secondary">{STATUS_LABELS[job.status] ?? job.status}</Badge>
              </div>

              {job.status === 'COMPLETED' && !job.hasReview && reviewingJobId !== job.id && (
                <Button size="sm" variant="outline" className="mt-4" onClick={() => setReviewingJobId(job.id)}>
                  Avaliar profissional
                </Button>
              )}

              {job.status === 'COMPLETED' && job.hasReview && (
                <p className="mt-3 text-sm text-muted-foreground">Já avaliaste este trabalho.</p>
              )}

              {reviewingJobId === job.id && (
                <ReviewForm
                  jobId={job.id}
                  onDone={() => {
                    setReviewingJobId(null);
                    load();
                  }}
                />
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
