import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface SpinnerProps {
  className?: string;
  size?: number;
  label?: string;
}

function Spinner({ className, size = 16, label = 'A carregar' }: SpinnerProps) {
  return (
    <span role="status" className={cn('inline-flex items-center', className)}>
      <Loader2 className="animate-spin text-muted-foreground" width={size} height={size} />
      <span className="sr-only">{label}</span>
    </span>
  );
}

export { Spinner };
