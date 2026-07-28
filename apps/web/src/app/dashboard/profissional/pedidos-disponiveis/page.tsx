import { Inbox } from 'lucide-react';
import { DashboardPageHeader } from '@/features/dashboard/components/page-header';
import { StubSection } from '@/features/dashboard/components/stub-section';

// Nota de implementação: quando os dados reais existirem, esta página
// reutiliza exatamente os mesmos componentes já construídos para
// "Os meus pedidos" do cliente — DataListToolbar + RequestCard +
// padrão de skeleton/empty/error (ver apps/web/src/app/dashboard/cliente/pedidos/page.tsx).
// Não duplicado aqui de propósito para não termos duas cópias da mesma
// lógica de pesquisa/filtro/ordenação/paginação.
export default function ProfessionalAvailableRequestsPage() {
  return (
    <div>
      <DashboardPageHeader title="Pedidos disponíveis" description="Pedidos compatíveis com as tuas categorias e zona." />
      <StubSection title="Pedidos disponíveis" icon={Inbox} />
    </div>
  );
}
