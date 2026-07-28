'use client';

import { useEffect, useState } from 'react';
import { Star } from 'lucide-react';
import { Card, EmptyState, Skeleton, ErrorState } from '@/components/ui';
import { DashboardPageHeader } from '@/features/dashboard/components/page-header';
import { fetchMyReviews, type ReviewsSummary } from '@/features/dashboard/services/reviews-api';

function Stars({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, index) => (
        <Star
          key={index}
          className={`size-4 ${index < rating ? 'fill-primary text-primary' : 'text-border'}`}
        />
      ))}
    </div>
  );
}

export default function ProfessionalReviewsPage() {
  const [summary, setSummary] = useState<ReviewsSummary | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetchMyReviews()
      .then(setSummary)
      .catch(() => setError(true));
  }, []);

  return (
    <div>
      <DashboardPageHeader title="Avaliações" description="O que os clientes disseram sobre o teu trabalho." />

      {error ? (
        <ErrorState onRetry={() => window.location.reload()} />
      ) : summary === null ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <Skeleton key={index} className="h-24 w-full rounded-xl" />
          ))}
        </div>
      ) : summary.count === 0 ? (
        <EmptyState
          icon={Star}
          title="Ainda não tens avaliações"
          description="Assim que um cliente avaliar um trabalho concluído, aparece aqui."
        />
      ) : (
        <>
          <Card className="mb-4 flex items-center gap-4 p-6">
            <p className="font-display text-4xl font-semibold">{summary.average?.toFixed(1)}</p>
            <div>
              <Stars rating={Math.round(summary.average ?? 0)} />
              <p className="mt-1 text-sm text-muted-foreground">
                {summary.count} avaliaç{summary.count === 1 ? 'ão' : 'ões'}
              </p>
            </div>
          </Card>

          <div className="space-y-3">
            {summary.items.map((review) => (
              <Card key={review.id} className="p-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="font-medium">{review.clientName}</p>
                  <Stars rating={review.rating} />
                </div>
                {review.comment && <p className="mt-2 text-sm text-muted-foreground">{review.comment}</p>}
                <p className="mt-2 text-xs text-muted-foreground">
                  {new Date(review.createdAt).toLocaleDateString('pt-PT')}
                </p>
              </Card>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
