import { Inbox } from 'lucide-react';
import { DashboardPageHeader } from '@/features/dashboard/components/page-header';
import { StubSection } from '@/features/dashboard/components/stub-section';

export default function ClientQuotesPage() {
  return (
    <div>
      <DashboardPageHeader title="Propostas recebidas" description="Orçamentos enviados por profissionais aos teus pedidos." />
      <StubSection title="Propostas recebidas" icon={Inbox} />
    </div>
  );
}
