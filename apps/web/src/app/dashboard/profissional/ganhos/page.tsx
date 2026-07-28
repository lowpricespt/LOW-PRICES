import { Wallet } from 'lucide-react';
import { DashboardPageHeader } from '@/features/dashboard/components/page-header';
import { StubSection } from '@/features/dashboard/components/stub-section';

// "Ganhos futuros (estrutura apenas)" — liga-se ao Payment/PricingService
// descrito em docs/business/BUSINESS_MODEL.md quando a Fase 12 (Pagamentos) existir.
export default function ProfessionalEarningsPage() {
  return (
    <div>
      <DashboardPageHeader title="Ganhos" description="Resumo de pagamentos recebidos pela plataforma." />
      <StubSection title="Ganhos" icon={Wallet} />
    </div>
  );
}
