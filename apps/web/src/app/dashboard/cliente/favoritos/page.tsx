import { Heart } from 'lucide-react';
import { DashboardPageHeader } from '@/features/dashboard/components/page-header';
import { StubSection } from '@/features/dashboard/components/stub-section';

export default function ClientFavoritesPage() {
  return (
    <div>
      <DashboardPageHeader title="Favoritos" description="Profissionais que guardaste para o futuro." />
      <StubSection title="Favoritos" icon={Heart} />
    </div>
  );
}
