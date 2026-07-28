import type { Metadata } from 'next';
import { Suspense } from 'react';
import { AuthLayout } from '@/features/auth/components';
import { Spinner } from '@/components/ui';
import { ConfirmEmailChangeForm } from './confirm-email-change-form';

export const metadata: Metadata = {
  title: 'Confirmar novo email',
};

export default function ConfirmEmailChangePage() {
  return (
    <AuthLayout title="Confirmar novo email" description="A confirmar a alteração do email da tua conta.">
      <Suspense
        fallback={
          <div className="flex justify-center py-8">
            <Spinner />
          </div>
        }
      >
        <ConfirmEmailChangeForm />
      </Suspense>
    </AuthLayout>
  );
}
