import { DashboardPageHeader } from '@/features/dashboard/components/page-header';
import { NotificationPreferencesSection } from '@/features/dashboard/components/notification-preferences-section';

export default function ClientNotificationsPage() {
  return (
    <div>
      <DashboardPageHeader title="Notificações" description="Escolhe como queres ser avisado." />
      <NotificationPreferencesSection />
    </div>
  );
}
