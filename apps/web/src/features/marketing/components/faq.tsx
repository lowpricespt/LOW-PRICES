import { ChevronDown } from 'lucide-react';

const FAQ_ITEMS = [
  {
    question: 'Quanto custa usar a Low Prices?',
    answer:
      'Pedir um serviço e receber orçamentos é gratuito. Cobramos apenas uma pequena percentagem ao profissional quando um trabalho é concluído.',
  },
  {
    question: 'Como sei se um profissional é de confiança?',
    answer:
      'Todos os profissionais passam por verificação de identidade e documentação antes de poderem aceitar pedidos, e ficam visíveis as avaliações de trabalhos anteriores.',
  },
  {
    question: 'Posso cancelar um pedido depois de aceitar um orçamento?',
    answer:
      'Sim. Podes cancelar diretamente no chat com o profissional; a nossa política de cancelamento fica sempre visível antes de confirmares.',
  },
  {
    question: 'A Low Prices está disponível em toda a Portugal?',
    answer:
      'Estamos a lançar por zonas, começando pelas principais áreas metropolitanas, com expansão contínua para o resto do país.',
  },
];

export function Faq() {
  return (
    <section id="faq" className="border-t border-border bg-background py-16 sm:py-20">
      <div className="container">
        <div className="mx-auto mb-10 max-w-xl text-center">
          <h2 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">
            Perguntas frequentes
          </h2>
        </div>

        <div className="mx-auto max-w-2xl divide-y divide-border rounded-2xl border border-border bg-background">
          {FAQ_ITEMS.map((item) => (
            <details key={item.question} className="group px-6 py-4 open:pb-5">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-1 text-sm font-medium marker:content-none">
                {item.question}
                <ChevronDown className="size-4 shrink-0 text-muted-foreground transition-transform group-open:rotate-180" />
              </summary>
              <p className="mt-2 text-sm text-muted-foreground">{item.answer}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
