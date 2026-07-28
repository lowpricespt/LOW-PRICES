'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button, Input } from '@/components/ui';
import { AuthLayout } from '@/features/auth/components';
import { forgotPasswordRequest } from '@/features/auth/services/auth-api';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSent, setIsSent] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setIsSubmitting(true);
    try {
      await forgotPasswordRequest(email);
    } finally {
      setIsSent(true);
      setIsSubmitting(false);
    }
  }

  return (
    <AuthLayout
      title="Recuperar palavra-passe"
      description="Enviamos-te um link para criares uma nova palavra-passe."
      footer={
        <Link href="/login" className="font-medium text-primary hover:underline">
          Voltar ao login
        </Link>
      }
    >
      {isSent ? (
        <p className="rounded-md bg-secondary px-4 py-3 text-sm">
          Se existir uma conta com esse email, vais receber um link para redefinires a palavra-passe. Verifica
          também a pasta de spam.
        </p>
      ) : (
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="forgot-email" className="mb-1.5 block text-sm font-medium">
              Email
            </label>
            <Input
              id="forgot-email"
              type="email"
              placeholder="tu@exemplo.com"
              autoComplete="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
          </div>
          <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? 'A enviar...' : 'Enviar link'}
          </Button>
        </form>
      )}
    </AuthLayout>
  );
}
