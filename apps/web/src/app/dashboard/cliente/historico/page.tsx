import { History } from 'lucide-react';
import { DashboardPageHeader } from '@/features/dashboard/components/page-header';
import { StubSection } from '@/features/dashboard/components/stub-section';

export default function ClientHistoryPage() {
  return (
    <div>
      <DashboardPageHeader title="Histórico" description="Todos os trabalhos já concluídos ou cancelados." />
      <StubSection title="Histórico" icon={History} />
    </div>
  );
}
