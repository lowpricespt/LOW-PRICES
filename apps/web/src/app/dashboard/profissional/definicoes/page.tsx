import { Settings } from 'lucide-react';
import { DashboardPageHeader } from '@/features/dashboard/components/page-header';
import { StubSection } from '@/features/dashboard/components/stub-section';

export default function ProfessionalSettingsPage() {
  return (
    <div>
      <DashboardPageHeader title="Definições" />
      <StubSection title="Definições" icon={Settings} />
    </div>
  );
}
