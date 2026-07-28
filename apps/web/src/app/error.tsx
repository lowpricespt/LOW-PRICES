'use client';

import { useEffect } from 'react';
import { ErrorState } from '@/components/ui';

export default function RootError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error('Erro não tratado na aplicação:', error);
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center px-6">
      <ErrorState
        title="Ocorreu um erro inesperado"
        description="A nossa equipa foi notificada. Tenta novamente ou volta mais tarde."
        onRetry={reset}
        retryLabel="Tentar novamente"
      />
    </div>
  );
}
