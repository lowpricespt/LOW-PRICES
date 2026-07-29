import { DashboardShell } from '@/features/dashboard/components/dashboard-shell';
import { RequireAdmin } from '@/features/admin/components/require-admin';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <RequireAdmin>
      <DashboardShell role="admin">{children}</DashboardShell>
    </RequireAdmin>
  );
}
