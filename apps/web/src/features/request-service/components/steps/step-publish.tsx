import { ShieldCheck } from 'lucide-react';

export function StepPublish() {
  return (
    <div>
      <h1 className="font-display text-2xl font-semibold tracking-tight sm:text-3xl">
        Tudo pronto para publicar
      </h1>
      <p className="mt-2 text-muted-foreground">
        O teu pedido vai ficar visível para profissionais da categoria e zona que escolheste.
      </p>

      <div className="mt-6 flex items-start gap-3 rounded-xl border border-border bg-secondary p-4">
        <ShieldCheck className="mt-0.5 size-5 shrink-0 text-primary" />
        <p className="text-sm text-muted-foreground">
          Os teus dados de contacto só são partilhados com um profissional depois de aceitares um
          orçamento.
        </p>
      </div>
    </div>
  );
}
