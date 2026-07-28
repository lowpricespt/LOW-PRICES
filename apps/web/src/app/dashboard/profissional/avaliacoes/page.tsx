import { Star } from 'lucide-react';
import { DashboardPageHeader } from '@/features/dashboard/components/page-header';
import { StubSection } from '@/features/dashboard/components/stub-section';

export default function ProfessionalReviewsPage() {
  return (
    <div>
      <DashboardPageHeader title="Avaliações" description="O que os clientes disseram sobre o teu trabalho." />
      <StubSection title="Avaliações" icon={Star} />
    </div>
  );
}
