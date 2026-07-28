import Link from 'next/link';
import { MapPin, Wrench, Star } from 'lucide-react';
import { Button, Card, SearchBar } from '@/components/ui';

export function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 -top-40 -z-10 flex justify-center"
      >
        <div className="h-80 w-[36rem] rounded-full bg-primary/10 blur-3xl" />
      </div>

      <div className="container grid gap-10 py-12 sm:py-16 md:py-20 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:py-28">
        <div className="flex flex-col items-start gap-5 text-left sm:gap-6">
          <span className="rounded-full border border-border bg-secondary px-3 py-1 text-xs font-medium text-muted-foreground">
            A chegar a Portugal em 2026
          </span>

          <h1 className="font-display text-3xl font-semibold leading-tight tracking-tight sm:text-4xl md:text-5xl lg:text-6xl">
            Encontra um profissional de confiança em{' '}
            <span className="text-primary">menos de 2 minutos</span>
          </h1>

          <p className="max-w-xl text-base text-muted-foreground sm:text-lg">
            Canalizadores, eletricistas, pintores e muito mais — perto de ti, avaliados por
            quem já os contratou. Descreve o que precisas e recebe orçamentos reais.
          </p>

          <SearchBar
            placeholder="Ex.: reparação de canalização"
            buttonLabel="Pedir agora"
            className="w-full"
          />

          <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
            <Button size="lg" className="w-full sm:w-auto" asChild>
              <Link href="/pedir-servico">Preciso de um serviço</Link>
            </Button>
            <Button size="lg" variant="outline" className="w-full sm:w-auto" asChild>
              <Link href="/registo/profissional">Quero trabalhar</Link>
            </Button>
          </div>
        </div>

        {/* Mockup visual do pedido de serviço — sem funcionalidade real nesta fase */}
        <Card className="relative w-full max-w-md justify-self-center rounded-2xl p-6 shadow-lg lg:justify-self-end">
          <p className="mb-4 text-sm font-medium text-muted-foreground">O teu pedido</p>

          <div className="flex items-center gap-3 rounded-lg border border-border bg-secondary px-4 py-3">
            <Wrench className="size-5 shrink-0 text-primary" />
            <span className="text-sm font-medium">Reparação de canalização</span>
          </div>

          <div className="mt-3 flex items-center gap-3 rounded-lg border border-border px-4 py-3">
            <MapPin className="size-5 shrink-0 text-accent" />
            <span className="text-sm text-muted-foreground">Vila Nova de Gaia, Porto</span>
          </div>

          <div className="mt-5 space-y-3">
            {[
              { nome: 'Miguel S.', avaliacao: '4.9', preco: '35€' },
              { nome: 'Ana R.', avaliacao: '5.0', preco: '42€' },
            ].map((profissional) => (
              <div
                key={profissional.nome}
                className="flex items-center justify-between rounded-lg border border-border p-3"
              >
                <div className="flex items-center gap-3">
                  <span className="flex size-9 items-center justify-center rounded-full bg-muted text-xs font-semibold text-muted-foreground">
                    {profissional.nome
                      .split(' ')
                      .map((n) => n[0])
                      .join('')}
                  </span>
                  <div>
                    <p className="text-sm font-medium">{profissional.nome}</p>
                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Star className="size-3 fill-primary text-primary" />
                      {profissional.avaliacao}
                    </span>
                  </div>
                </div>
                <span className="text-sm font-semibold">{profissional.preco}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </section>
  );
}
