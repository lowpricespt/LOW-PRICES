import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface StepperStep {
  id: string;
  label: string;
}

export interface StepperProps {
  steps: StepperStep[];
  currentStepIndex: number;
  className?: string;
}

function Stepper({ steps, currentStepIndex, className }: StepperProps) {
  const total = steps.length;
  const current = steps[currentStepIndex];
  const progressPercent = Math.round(((currentStepIndex + 1) / total) * 100);

  return (
    <div className={cn('w-full', className)}>
      {/* Mobile: contador + barra de progresso — mantém o cabeçalho compacto no telemóvel */}
      <div className="md:hidden">
        <div className="mb-2 flex items-center justify-between gap-2 text-sm">
          <span className="shrink-0 font-medium">
            Passo {currentStepIndex + 1} de {total}
          </span>
          <span className="truncate text-muted-foreground">{current?.label}</span>
        </div>
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-secondary">
          <div
            className="h-full rounded-full bg-primary transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Desktop/tablet: passos numerados com ligações */}
      <ol className="hidden items-center md:flex">
        {steps.map((step, index) => {
          const isCompleted = index < currentStepIndex;
          const isCurrent = index === currentStepIndex;

          return (
            <li key={step.id} className="flex flex-1 items-center last:flex-none">
              <div className="flex flex-col items-center gap-1.5">
                <span
                  className={cn(
                    'flex size-8 shrink-0 items-center justify-center rounded-full border text-xs font-semibold transition-colors',
                    isCompleted && 'border-primary bg-primary text-primary-foreground',
                    isCurrent && 'border-primary text-primary',
                    !isCompleted && !isCurrent && 'border-border text-muted-foreground',
                  )}
                >
                  {isCompleted ? <Check className="size-4" /> : index + 1}
                </span>
                <span
                  className={cn(
                    'max-w-20 text-center text-xs',
                    isCurrent ? 'font-medium text-foreground' : 'text-muted-foreground',
                  )}
                >
                  {step.label}
                </span>
              </div>
              {index < steps.length - 1 ? (
                <div className={cn('mx-2 h-px flex-1', isCompleted ? 'bg-primary' : 'bg-border')} />
              ) : null}
            </li>
          );
        })}
      </ol>
    </div>
  );
}

export { Stepper };
