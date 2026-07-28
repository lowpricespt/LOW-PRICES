import { User } from 'lucide-react';
import { DashboardPageHeader } from '@/features/dashboard/components/page-header';
import { StubSection } from '@/features/dashboard/components/stub-section';

export default function ProfessionalProfilePage() {
  return (
    <div>
      <DashboardPageHeader title="Perfil" description="A tua descrição pública, categorias e documentos." />
      <StubSection title="Perfil" icon={User} />
    </div>
  );
}
