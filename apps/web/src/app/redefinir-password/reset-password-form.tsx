'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Button, Input } from '@/components/ui';
import type { ApiError } from '@/services/api';
import { resetPasswordRequest } from '@/features/auth/services/auth-api';

export function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [newPassword, setNewPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDone, setIsDone] = useState(false);

  if (!token) {
    return (
      <p className="rounded-md bg-destructive/10 px-4 py-3 text-sm text-destructive">
        Este link é inválido. Pede um novo em{' '}
        <Link href="/recuperar-password" className="underline">
          recuperar palavra-passe
        </Link>
        .
      </p>
    );
  }

  if (isDone) {
    return (
      <div className="space-y-4">
        <p className="rounded-md bg-secondary px-4 py-3 text-sm">Palavra-passe redefinida com sucesso.</p>
        <Button className="w-full" onClick={() => router.push('/login')}>
          Ir para o login
        </Button>
      </div>
    );
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      await resetPasswordRequest(token!, newPassword);
      setIsDone(true);
    } catch (err) {
      setError((err as ApiError).message ?? 'Não foi possível redefinir a palavra-passe. O link pode ter expirado.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      {error ? <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</p> : null}

      <div>
        <label htmlFor="new-password" className="mb-1.5 block text-sm font-medium">
          Nova palavra-passe
        </label>
        <Input
          id="new-password"
          type="password"
          placeholder="Mínimo 8 caracteres, com maiúscula e número"
          autoComplete="new-password"
          required
          value={newPassword}
          onChange={(event) => setNewPassword(event.target.value)}
        />
      </div>

      <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? 'A guardar...' : 'Redefinir palavra-passe'}
      </Button>
    </form>
  );
}
