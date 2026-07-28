import type { Metadata } from 'next';
import { Suspense } from 'react';
import { AuthLayout } from '@/features/auth/components';
import { Spinner } from '@/components/ui';
import { ResetPasswordForm } from './reset-password-form';

export const metadata: Metadata = {
  title: 'Redefinir palavra-passe',
};

export default function ResetPasswordPage() {
  return (
    <AuthLayout title="Cria uma nova palavra-passe" description="Escolhe uma palavra-passe forte e única.">
      <Suspense
        fallback={
          <div className="flex justify-center py-8">
            <Spinner />
          </div>
        }
      >
        <ResetPasswordForm />
      </Suspense>
    </AuthLayout>
  );
}
