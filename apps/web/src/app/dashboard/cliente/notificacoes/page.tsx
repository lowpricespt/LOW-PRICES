import { Bell } from 'lucide-react';
import { DashboardPageHeader } from '@/features/dashboard/components/page-header';
import { StubSection } from '@/features/dashboard/components/stub-section';

export default function ClientNotificationsPage() {
  return (
    <div>
      <DashboardPageHeader title="Notificações" />
      <StubSection title="Notificações" icon={Bell} />
    </div>
  );
}
