import { DashboardPageHeader } from '@/features/dashboard/components/page-header';
import { AccountSecuritySection } from '@/features/dashboard/components/account-security-section';

export default function ClientSettingsPage() {
  return (
    <div>
      <DashboardPageHeader title="Definições" description="Segurança da conta: palavra-passe, email e privacidade." />
      <AccountSecuritySection />
    </div>
  );
}
