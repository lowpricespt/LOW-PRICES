import { Star } from 'lucide-react';
import { Avatar, Card } from '@/components/ui';

// Testemunhos fictícios, apenas para validar o layout — substituir por
// avaliações reais assim que a Fase 9 (Avaliações) estiver implementada.
const TESTIMONIALS = [
  {
    name: 'Rita Fernandes',
    role: 'Cliente em Gaia',
    quote:
      'Pedi um eletricista às 9h e às 11h já tinha três orçamentos. Escolhi o mais bem avaliado e ficou tudo resolvido no mesmo dia.',
    rating: 5,
  },
  {
    name: 'Carlos Mendes',
    role: 'Canalizador profissional',
    quote:
      'Desde que comecei a receber pedidos pela Low Prices, deixei de perder tempo a negociar por telefone. Está tudo organizado num só sítio.',
    rating: 5,
  },
  {
    name: 'Sofia Almeida',
    role: 'Cliente em Lisboa',
    quote:
      'Gostei de ver o preço antes de aceitar. Sem surpresas na fatura final, como já me aconteceu noutras plataformas.',
    rating: 4,
  },
];

export function Testimonials() {
  return (
    <section className="py-20">
      <div className="container">
        <div className="mx-auto mb-14 max-w-xl text-center">
          <h2 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">
            Quem usa, recomenda
          </h2>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {TESTIMONIALS.map((testimonial) => (
            <Card key={testimonial.name} className="flex flex-col gap-4 rounded-2xl p-6">
              <div className="flex gap-0.5">
                {Array.from({ length: 5 }).map((_, index) => (
                  <Star
                    key={index}
                    className={`size-4 ${
                      index < testimonial.rating
                        ? 'fill-primary text-primary'
                        : 'fill-muted text-muted'
                    }`}
                  />
                ))}
              </div>

              <p className="flex-1 text-sm leading-relaxed text-foreground">
                “{testimonial.quote}”
              </p>

              <div className="flex items-center gap-3 pt-2">
                <Avatar alt={testimonial.name} fallback={testimonial.name} size="sm" />
                <div>
                  <p className="text-sm font-medium">{testimonial.name}</p>
                  <p className="text-xs text-muted-foreground">{testimonial.role}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
