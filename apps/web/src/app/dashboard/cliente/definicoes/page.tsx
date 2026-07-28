import { Settings } from 'lucide-react';
import { DashboardPageHeader } from '@/features/dashboard/components/page-header';
import { StubSection } from '@/features/dashboard/components/stub-section';

export default function ClientSettingsPage() {
  return (
    <div>
      <DashboardPageHeader title="Definições" description="Preferências da conta, notificações e privacidade." />
      <StubSection title="Definições" icon={Settings} />
    </div>
  );
}
