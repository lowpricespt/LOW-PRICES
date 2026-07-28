import Link from 'next/link';
import { CheckCircle2, Crown } from 'lucide-react';
import { Button } from '@/components/ui';

export function OnboardingSubmitted() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-6 text-center">
      <span className="flex size-16 items-center justify-center rounded-full bg-success/10">
        <CheckCircle2 className="size-8 text-success" />
      </span>
      <h1 className="font-display text-2xl font-semibold tracking-tight sm:text-3xl">Conta criada!</h1>
      <p className="max-w-sm text-muted-foreground">
        Vamos rever o teu perfil e avisar-te por email assim que estiver aprovado. Enquanto isso, já podes ver
        os planos disponíveis para começares a receber pedidos da tua área assim que fores aprovado.
      </p>

      <Button size="lg" asChild className="mt-2 gap-2">
        <Link href="/dashboard/profissional/premium">
          <Crown className="size-4" />
          Ver planos disponíveis
        </Link>
      </Button>
      <Button variant="ghost" asChild>
        <Link href="/dashboard/profissional">Ver mais tarde</Link>
      </Button>
    </div>
  );
}
