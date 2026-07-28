import { Inbox } from 'lucide-react';
import { Card, EmptyState } from '@/components/ui';
import { DashboardPageHeader } from '@/features/dashboard/components/page-header';

export default function ProfessionalDashboardHomePage() {
  return (
    <div>
      <DashboardPageHeader title="Olá!" description="Aqui está um resumo da tua atividade." />

      <div className="mb-8 grid gap-4 sm:grid-cols-3">
        <Card className="p-4">
          <p className="text-xs text-muted-foreground">Pedidos disponíveis</p>
          <p className="mt-1 font-display text-2xl font-semibold">0</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs text-muted-foreground">Trabalhos esta semana</p>
          <p className="mt-1 font-display text-2xl font-semibold">0</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs text-muted-foreground">Avaliação média</p>
          <p className="mt-1 font-display text-2xl font-semibold">—</p>
        </Card>
      </div>

      <EmptyState
        icon={Inbox}
        title="Ainda não há pedidos disponíveis"
        description="Assim que aparecer um pedido compatível com as tuas categorias e zona, aparece aqui."
      />
    </div>
  );
}
