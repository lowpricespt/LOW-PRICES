import { DashboardShell } from '@/features/dashboard/components/dashboard-shell';

export default function ProfessionalDashboardLayout({ children }: { children: React.ReactNode }) {
  return <DashboardShell role="professional">{children}</DashboardShell>;
}
