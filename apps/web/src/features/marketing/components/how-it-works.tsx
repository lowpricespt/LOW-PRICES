import { ClipboardList, MessagesSquare, CheckCircle2 } from 'lucide-react';

const STEPS = [
  {
    number: '01',
    icon: ClipboardList,
    title: 'Descreve o que precisas',
    description: 'Escolhe a categoria, a localização e quando precisas do serviço.',
  },
  {
    number: '02',
    icon: MessagesSquare,
    title: 'Recebe orçamentos',
    description: 'Profissionais da tua zona respondem com preço e disponibilidade.',
  },
  {
    number: '03',
    icon: CheckCircle2,
    title: 'Escolhe e avalia',
    description: 'Aceita o orçamento que preferires e paga em segurança pela plataforma.',
  },
];

export function HowItWorks() {
  return (
    <section id="como-funciona" className="border-t border-border bg-background py-16 sm:py-20">
      <div className="container">
        <div className="mx-auto mb-14 max-w-xl text-center">
          <h2 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">
            Como funciona
          </h2>
          <p className="mt-3 text-muted-foreground">
            Três passos, do pedido ao serviço feito.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-3">
          {STEPS.map((step) => (
            <div key={step.number} className="relative rounded-2xl border border-border bg-background p-6">
              <span className="font-display text-sm font-semibold text-primary">{step.number}</span>
              <div className="mt-4 flex size-11 items-center justify-center rounded-xl bg-primary/10">
                <step.icon className="size-5 text-primary" />
              </div>
              <h3 className="mt-4 font-display text-lg font-semibold">{step.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
