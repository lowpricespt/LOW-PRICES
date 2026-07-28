import { cn } from '@/lib/utils';
import { Spinner } from './spinner';

export interface LoadingProps {
  message?: string;
  fullScreen?: boolean;
  className?: string;
}

function Loading({ message = 'A carregar…', fullScreen = false, className }: LoadingProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center gap-3',
        fullScreen ? 'h-screen w-screen' : 'py-16',
        className,
      )}
    >
      <Spinner size={28} label={message} />
      <p className="text-sm text-muted-foreground">{message}</p>
    </div>
  );
}

export { Loading };
