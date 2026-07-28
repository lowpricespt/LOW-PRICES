import { DashboardPageHeader } from '@/features/dashboard/components/page-header';
import { AccountSecuritySection } from '@/features/dashboard/components/account-security-section';
import { NotificationPreferencesSection } from '@/features/dashboard/components/notification-preferences-section';

export default function ProfessionalSettingsPage() {
  return (
    <div>
      <DashboardPageHeader title="Definições" description="Segurança da conta: palavra-passe, email e privacidade." />
      <div className="space-y-6">
        <NotificationPreferencesSection />
        <AccountSecuritySection />
      </div>
    </div>
  );
}
