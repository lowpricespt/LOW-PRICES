import { ShieldCheck, Timer, Wallet, MessageCircle } from 'lucide-react';

const BENEFITS = [
  {
    icon: ShieldCheck,
    title: 'Profissionais verificados',
    description: 'Documentos e identidade confirmados antes de aparecerem na plataforma.',
  },
  {
    icon: Timer,
    title: 'Resposta rápida',
    description: 'A maioria dos pedidos recebe o primeiro orçamento em poucas horas.',
  },
  {
    icon: Wallet,
    title: 'Preços transparentes',
    description: 'Vês o orçamento completo antes de aceitares — sem surpresas.',
  },
  {
    icon: MessageCircle,
    title: 'Chat direto',
    description: 'Combina detalhes com o profissional sem sair da plataforma.',
  },
];

export function Benefits() {
  return (
    <section className="border-t border-border bg-background py-16 sm:py-20">
      <div className="container">
        <div className="mx-auto mb-14 max-w-xl text-center">
          <h2 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">
            Porque escolher a Low Prices
          </h2>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {BENEFITS.map((benefit) => (
            <div key={benefit.title} className="rounded-2xl border border-border bg-background p-6">
              <div className="flex size-11 items-center justify-center rounded-xl bg-primary/10">
                <benefit.icon className="size-5 text-primary" />
              </div>
              <h3 className="mt-4 font-display text-base font-semibold">{benefit.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{benefit.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
