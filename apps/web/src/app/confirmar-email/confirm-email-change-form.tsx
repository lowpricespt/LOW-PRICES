'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Button, Spinner } from '@/components/ui';
import type { ApiError } from '@/services/api';
import { confirmEmailChangeRequest } from '@/features/auth/services/auth-api';

type Status = 'loading' | 'success' | 'error';

export function ConfirmEmailChangeForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [status, setStatus] = useState<Status>('loading');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setErrorMessage('Este link é inválido — falta o token de confirmação.');
      return;
    }

    confirmEmailChangeRequest(token)
      .then(() => setStatus('success'))
      .catch((err) => {
        setStatus('error');
        setErrorMessage((err as ApiError).message ?? 'Este link é inválido ou já expirou.');
      });
  }, [token]);

  if (status === 'loading') {
    return (
      <div className="flex justify-center py-8">
        <Spinner />
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="space-y-4">
        <p className="rounded-md bg-destructive/10 px-4 py-3 text-sm text-destructive">{errorMessage}</p>
        <Link href="/login" className="text-sm text-primary underline">
          Voltar ao login
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <p className="rounded-md bg-secondary px-4 py-3 text-sm">
        Email confirmado com sucesso. A tua conta já usa o novo endereço — entra novamente para continuares.
      </p>
      <Button className="w-full" onClick={() => router.push('/login')}>
        Ir para o login
      </Button>
    </div>
  );
}
