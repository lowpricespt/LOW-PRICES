import type { Metadata } from 'next';
import { Suspense } from 'react';
import Link from 'next/link';
import { AuthLayout, LoginForm } from '@/features/auth/components';
import { Spinner } from '@/components/ui';

export const metadata: Metadata = {
  title: 'Entrar',
};

export default function LoginPage() {
  return (
    <AuthLayout
      title="Entra na tua conta"
      description="Acede aos teus pedidos e conversas."
      footer={
        <>
          Ainda não tens conta?{' '}
          <Link href="/registo" className="font-medium text-primary hover:underline">
            Criar conta
          </Link>
        </>
      }
    >
      <Suspense fallback={<div className="flex justify-center py-8"><Spinner /></div>}>
        <LoginForm />
      </Suspense>
    </AuthLayout>
  );
}
