import { MessageCircle } from 'lucide-react';
import { DashboardPageHeader } from '@/features/dashboard/components/page-header';
import { StubSection } from '@/features/dashboard/components/stub-section';

export default function ClientConversationsPage() {
  return (
    <div>
      <DashboardPageHeader title="Conversas" description="Fala diretamente com os profissionais dos teus pedidos." />
      <StubSection title="Conversas" icon={MessageCircle} />
    </div>
  );
}
