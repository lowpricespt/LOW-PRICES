import { MessageCircle } from 'lucide-react';
import { DashboardPageHeader } from '@/features/dashboard/components/page-header';
import { StubSection } from '@/features/dashboard/components/stub-section';

export default function ProfessionalConversationsPage() {
  return (
    <div>
      <DashboardPageHeader title="Conversas" />
      <StubSection title="Conversas" icon={MessageCircle} />
    </div>
  );
}
