import Link from 'next/link';
import { CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui';

export function RequestPublished() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-6 text-center">
      <span className="flex size-16 items-center justify-center rounded-full bg-success/10">
        <CheckCircle2 className="size-8 text-success" />
      </span>
      <h1 className="font-display text-2xl font-semibold tracking-tight sm:text-3xl">
        Pedido publicado!
      </h1>
      <p className="max-w-sm text-muted-foreground">
        Vais receber uma notificação assim que um profissional enviar o primeiro orçamento.
      </p>
      <Button size="lg" asChild className="mt-2">
        <Link href="/dashboard/cliente">Voltar ao início</Link>
      </Button>
    </div>
  );
}
