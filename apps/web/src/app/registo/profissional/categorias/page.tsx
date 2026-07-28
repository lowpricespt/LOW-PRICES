import type { Metadata } from 'next';
import { RequireAuth } from '@/features/auth/components/require-auth';
import { CompleteCategories } from '@/features/professional-onboarding/components';

export const metadata: Metadata = {
  title: 'Escolhe as tuas categorias',
};

export default function ProfessionalCategoriesPage() {
  return (
    <RequireAuth>
      <CompleteCategories />
    </RequireAuth>
  );
}
