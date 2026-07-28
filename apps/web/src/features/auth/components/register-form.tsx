'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Input, GoogleLoginButton } from '@/components/ui';
import { useAuth } from '@/providers/auth-provider';
import type { ApiError } from '@/services/api';

export function RegisterForm() {
  const router = useRouter();
  const { register } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      await register({ name, email, password, role: 'CLIENT' });
      router.push('/dashboard/cliente');
    } catch (err) {
      setError((err as ApiError).message ?? 'Não foi possível criar a conta. Tenta novamente.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <GoogleLoginButton />

      <div className="flex items-center gap-3 text-xs text-muted-foreground">
        <span className="h-px flex-1 bg-border" />
        ou com email
        <span className="h-px flex-1 bg-border" />
      </div>

      {error ? (
        <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</p>
      ) : null}

      <div>
        <label htmlFor="register-name" className="mb-1.5 block text-sm font-medium">
          Nome
        </label>
        <Input
          id="register-name"
          placeholder="O teu nome"
          autoComplete="name"
          required
          value={name}
          onChange={(event) => setName(event.target.value)}
        />
      </div>

      <div>
        <label htmlFor="register-email" className="mb-1.5 block text-sm font-medium">
          Email
        </label>
        <Input
          id="register-email"
          type="email"
          placeholder="tu@exemplo.com"
          autoComplete="email"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
        />
      </div>

      <div>
        <label htmlFor="register-password" className="mb-1.5 block text-sm font-medium">
          Palavra-passe
        </label>
        <Input
          id="register-password"
          type="password"
          placeholder="Mínimo 8 caracteres, com maiúscula e número"
          autoComplete="new-password"
          required
          minLength={8}
          value={password}
          onChange={(event) => setPassword(event.target.value)}
        />
      </div>

      <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? 'A criar conta...' : 'Criar conta'}
      </Button>
    </form>
  );
}
