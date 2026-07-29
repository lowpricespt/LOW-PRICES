import { DashboardShell } from '@/features/dashboard/components/dashboard-shell';
import { RequireAuth } from '@/features/auth/components/require-auth';

export default function ClientDashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <RequireAuth>
      <DashboardShell role="client">{children}</DashboardShell>
    </RequireAuth>
  );
}
