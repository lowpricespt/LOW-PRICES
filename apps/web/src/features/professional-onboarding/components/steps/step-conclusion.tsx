import { PartyPopper } from 'lucide-react';

export function StepConclusion() {
  return (
    <div>
      <h1 className="font-display text-2xl font-semibold tracking-tight sm:text-3xl">
        Só falta confirmar
      </h1>
      <p className="mt-2 text-muted-foreground">
        A tua conta fica pendente de verificação — costuma demorar menos de 24 horas.
      </p>

      <div className="mt-6 flex flex-col items-center gap-3 rounded-xl border border-border bg-secondary p-8 text-center">
        <PartyPopper className="size-8 text-primary" />
        <p className="text-sm text-muted-foreground">
          Assim que aprovarmos o teu perfil, começas a receber pedidos da tua zona.
        </p>
      </div>
    </div>
  );
}
