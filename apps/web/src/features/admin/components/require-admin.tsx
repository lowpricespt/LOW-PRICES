'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/providers/auth-provider';
import { Spinner } from '@/components/ui';

/**
 * Equivalente a <RequireAuth> mas também exige role ADMIN — sem isto, um
 * utilizador CLIENT/PROFESSIONAL autenticado conseguiria navegar para
 * /admin e só descobriria que não tem acesso quando cada chamada à API
 * (todas com @Roles('ADMIN') no backend) devolvesse 403.
 */
export function RequireAdmin({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;
    if (!user) {
      router.replace('/login?next=/admin');
      return;
    }
    if (user.role !== 'ADMIN') {
      router.replace(user.role === 'PROFESSIONAL' ? '/dashboard/profissional' : '/dashboard/cliente');
    }
  }, [isLoading, user, router]);

  if (isLoading || !user || user.role !== 'ADMIN') {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Spinner />
      </div>
    );
  }

  return <>{children}</>;
}
