import { LogoMark } from './logo-mark';
import { cn } from '@/lib/utils';

export interface LogoHorizontalProps {
  className?: string;
  markSize?: number;
}

export function LogoHorizontal({ className, markSize = 32 }: LogoHorizontalProps) {
  return (
    <span className={cn('inline-flex items-center gap-2.5', className)}>
      <LogoMark size={markSize} />
      <span className="font-display text-lg font-semibold tracking-tight text-foreground">
        Low Prices
      </span>
    </span>
  );
}
