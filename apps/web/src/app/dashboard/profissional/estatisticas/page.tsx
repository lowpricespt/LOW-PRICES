import { BarChart3 } from 'lucide-react';
import { DashboardPageHeader } from '@/features/dashboard/components/page-header';
import { StubSection } from '@/features/dashboard/components/stub-section';

export default function ProfessionalStatsPage() {
  return (
    <div>
      <DashboardPageHeader title="Estatísticas" description="Desempenho, taxa de resposta e conversão." />
      <StubSection title="Estatísticas" icon={BarChart3} />
    </div>
  );
}
