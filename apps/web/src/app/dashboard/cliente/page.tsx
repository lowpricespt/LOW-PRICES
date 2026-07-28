import Link from 'next/link';
import { ClipboardList } from 'lucide-react';
import { Button, Card, EmptyState } from '@/components/ui';
import { DashboardPageHeader } from '@/features/dashboard/components/page-header';

export default function ClientDashboardHomePage() {
  return (
    <div>
      <DashboardPageHeader
        title="Olá!"
        description="Aqui está um resumo da tua atividade."
        action={
          <Button asChild>
            <Link href="/pedir-servico">Novo pedido</Link>
          </Button>
        }
      />

      <div className="mb-8 grid gap-4 sm:grid-cols-3">
        <Card className="p-4">
          <p className="text-xs text-muted-foreground">Pedidos ativos</p>
          <p className="mt-1 font-display text-2xl font-semibold">0</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs text-muted-foreground">Orçamentos por rever</p>
          <p className="mt-1 font-display text-2xl font-semibold">0</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs text-muted-foreground">Trabalhos concluídos</p>
          <p className="mt-1 font-display text-2xl font-semibold">0</p>
        </Card>
      </div>

      <EmptyState
        icon={ClipboardList}
        title="Ainda não tens pedidos"
        description="Quando pedires um serviço, ele aparece aqui."
        action={
          <Button asChild size="sm">
            <Link href="/pedir-servico">Pedir um serviço</Link>
          </Button>
        }
      />
    </div>
  );
}
