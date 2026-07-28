import { DashboardShell } from '@/features/dashboard/components/dashboard-shell';

export default function ClientDashboardLayout({ children }: { children: React.ReactNode }) {
  return <DashboardShell role="client">{children}</DashboardShell>;
}
