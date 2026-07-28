import type { Metadata } from 'next';
import { RequireAuth } from '@/features/auth/components/require-auth';
import { RequestServiceWizard } from '@/features/request-service/components';

export const metadata: Metadata = {
  title: 'Pedir um serviço',
};

export default function RequestServicePage() {
  return (
    <RequireAuth>
      <RequestServiceWizard />
    </RequireAuth>
  );
}
