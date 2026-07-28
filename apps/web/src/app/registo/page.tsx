import type { Metadata } from 'next';
import Link from 'next/link';
import { AuthLayout, RegisterForm } from '@/features/auth/components';

export const metadata: Metadata = {
  title: 'Criar conta',
};

export default function RegisterPage() {
  return (
    <AuthLayout
      title="Cria a tua conta"
      description="Pede serviços e acompanha os teus orçamentos."
      footer={
        <>
          Já tens conta?{' '}
          <Link href="/login" className="font-medium text-primary hover:underline">
            Entrar
          </Link>
          <span className="mx-2 text-border">·</span>
          <Link href="/registo/profissional" className="font-medium text-primary hover:underline">
            Sou profissional
          </Link>
        </>
      }
    >
      <RegisterForm />
    </AuthLayout>
  );
}
