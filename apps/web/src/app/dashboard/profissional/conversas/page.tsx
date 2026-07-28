import { DashboardPageHeader } from '@/features/dashboard/components/page-header';
import { ConversationsSection } from '@/features/dashboard/components/conversations-section';

export default function ProfessionalConversationsPage() {
  return (
    <div>
      <DashboardPageHeader title="Conversas" description="Fala diretamente com os clientes dos teus trabalhos." />
      <ConversationsSection />
    </div>
  );
}
