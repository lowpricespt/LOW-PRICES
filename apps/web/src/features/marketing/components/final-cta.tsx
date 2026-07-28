import Link from 'next/link';
import { Button } from '@/components/ui';

export function FinalCta() {
  return (
    <section className="py-20">
      <div className="container">
        <div className="relative overflow-hidden rounded-3xl bg-primary px-8 py-16 text-center sm:px-16">
          <div
            aria-hidden
            className="pointer-events-none absolute -right-16 -top-16 size-64 rounded-full bg-white/10"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute -bottom-20 -left-10 size-72 rounded-full bg-white/10"
          />

          <h2 className="font-display text-3xl font-semibold tracking-tight text-primary-foreground sm:text-4xl">
            Precisas de um profissional hoje?
          </h2>
          <p className="mx-auto mt-3 max-w-lg text-primary-foreground/90">
            Descreve o serviço e recebe os primeiros orçamentos ainda hoje.
          </p>

          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Button size="lg" variant="secondary" asChild>
              <Link href="/pedir-servico">Preciso de um serviço</Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-primary-foreground/40 bg-transparent text-primary-foreground hover:bg-white/10 hover:text-primary-foreground"
              asChild
            >
              <Link href="/registo/profissional">Quero trabalhar</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
