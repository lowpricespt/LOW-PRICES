'use client';

import Link from 'next/link';
import { ArrowLeft, X } from 'lucide-react';
import { Button, Stepper, type StepperStep } from '@/components/ui';

export interface WizardShellProps {
  steps: StepperStep[];
  currentStepIndex: number;
  onBack: () => void;
  onNext: () => void;
  exitHref: string;
  nextLabel?: string;
  isNextDisabled?: boolean;
  isSubmitting?: boolean;
  children: React.ReactNode;
}

/**
 * Layout partilhado por qualquer fluxo em passos (pedido de serviço,
 * onboarding de profissional, etc.). Mobile first: no telemóvel mostra
 * apenas o essencial (voltar, progresso, sair); no desktop mostra o
 * Stepper completo. A navegação Voltar/Continuar fica sempre visível
 * no fundo do ecrã, ao alcance do polegar.
 */
export function WizardShell({
  steps,
  currentStepIndex,
  onBack,
  onNext,
  exitHref,
  nextLabel = 'Continuar',
  isNextDisabled = false,
  isSubmitting = false,
  children,
}: WizardShellProps) {
  const isFirstStep = currentStepIndex === 0;

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="sticky top-0 z-30 border-b border-border bg-background/95 backdrop-blur">
        <div className="container flex h-16 items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={onBack}
            disabled={isFirstStep}
            aria-label="Passo anterior"
          >
            <ArrowLeft className="size-5" />
          </Button>

          <div className="flex-1">
            <Stepper steps={steps} currentStepIndex={currentStepIndex} />
          </div>

          <Button variant="ghost" size="icon" asChild aria-label="Sair">
            <Link href={exitHref}>
              <X className="size-5" />
            </Link>
          </Button>
        </div>
      </header>

      <main className="container flex-1 py-8 sm:py-12">
        <div className="mx-auto max-w-xl">{children}</div>
      </main>

      <footer className="sticky bottom-0 z-30 border-t border-border bg-background/95 backdrop-blur">
        <div className="container flex items-center justify-end gap-3 py-4">
          {!isFirstStep && (
            <Button variant="outline" size="lg" onClick={onBack} className="hidden sm:inline-flex">
              Voltar
            </Button>
          )}
          <Button size="lg" onClick={onNext} disabled={isNextDisabled || isSubmitting} className="w-full sm:w-auto">
            {isSubmitting ? 'A publicar...' : nextLabel}
          </Button>
        </div>
      </footer>
    </div>
  );
}
