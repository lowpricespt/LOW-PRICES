import { TriangleAlert } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from './button';

export interface ErrorStateProps {
  title?: string;
  description?: string;
  onRetry?: () => void;
  retryLabel?: string;
  className?: string;
}

function ErrorState({
  title = 'Algo correu mal',
  description = 'Não foi possível carregar esta informação. Tenta novamente.',
  onRetry,
  retryLabel = 'Tentar novamente',
  className,
}: ErrorStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center gap-3 rounded-lg border border-destructive/20',
        'bg-destructive/5 px-6 py-16 text-center',
        className,
      )}
    >
      <TriangleAlert className="size-10 text-destructive" strokeWidth={1.5} />
      <div className="space-y-1">
        <p className="font-display text-base font-semibold">{title}</p>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      {onRetry ? (
        <Button variant="outline" size="sm" onClick={onRetry}>
          {retryLabel}
        </Button>
      ) : null}
    </div>
  );
}

export { ErrorState };
