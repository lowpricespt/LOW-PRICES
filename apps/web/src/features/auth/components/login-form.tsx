'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Button, Input, GoogleLoginButton } from '@/components/ui';
import { useAuth } from '@/providers/auth-provider';
import type { ApiError } from '@/services/api';

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      const user = await login(email, password);
      const defaultDestination =
        user.role === 'ADMIN' ? '/admin' : user.role === 'PROFESSIONAL' ? '/dashboard/profissional' : '/dashboard/cliente';

      // `next` vem de RequireAuth (?next=/dashboard/profissional, por
      // exemplo) sempre que a sessão expirou a meio de uma página
      // protegida — mas fica na URL mesmo que a pessoa entre a seguir com
      // uma conta DIFERENTE (outro role). Sem esta validação, um admin que
      // reentra a partir desse link acaba dentro do dashboard do
      // profissional, porque `next` era honrado às cegas, sem verificar
      // se ainda faz sentido para a conta que acabou de iniciar sessão.
      const next = searchParams.get('next');
      const destination = next && next.startsWith(defaultDestination) ? next : defaultDestination;
      router.push(destination);
    } catch (err) {
      setError((err as ApiError).message ?? 'Não foi possível entrar. Tenta novamente.');
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
        <label htmlFor="login-email" className="mb-1.5 block text-sm font-medium">
          Email
        </label>
        <Input
          id="login-email"
          type="email"
          placeholder="tu@exemplo.com"
          autoComplete="email"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
        />
      </div>

      <div>
        <div className="mb-1.5 flex items-center justify-between">
          <label htmlFor="login-password" className="text-sm font-medium">
            Palavra-passe
          </label>
          <Link href="/recuperar-password" className="text-xs font-medium text-primary hover:underline">
            Esqueceste-te?
          </Link>
        </div>
        <Input
          id="login-password"
          type="password"
          placeholder="A tua palavra-passe"
          autoComplete="current-password"
          required
          value={password}
          onChange={(event) => setPassword(event.target.value)}
        />
      </div>

      <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? 'A entrar...' : 'Entrar'}
      </Button>
    </form>
  );
}
