'use client';

import { cn } from '@/lib/utils';
import { URGENCY_OPTIONS } from '../../constants/steps';
import { useRequestServiceStore } from '../../store/use-request-service-store';

export function StepUrgency() {
  const urgency = useRequestServiceStore((state) => state.formData.urgency);
  const updateFormData = useRequestServiceStore((state) => state.updateFormData);

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold tracking-tight sm:text-3xl">
        Para quando precisas?
      </h1>
      <p className="mt-2 text-muted-foreground">Isto ajuda os profissionais a organizarem a agenda.</p>

      <div className="mt-6 flex flex-col gap-3">
        {URGENCY_OPTIONS.map((option) => {
          const isSelected = urgency === option.id;
          return (
            <button
              key={option.id}
              type="button"
              onClick={() => updateFormData({ urgency: option.id })}
              className={cn(
                'flex items-center justify-between rounded-xl border px-4 py-3.5 text-left text-sm font-medium transition-colors',
                isSelected
                  ? 'border-primary bg-primary/5 ring-1 ring-primary'
                  : 'border-border hover:border-primary/40 hover:bg-primary/5',
              )}
            >
              {option.label}
              <span
                className={cn(
                  'size-4 rounded-full border-2',
                  isSelected ? 'border-primary bg-primary' : 'border-border',
                )}
              />
            </button>
          );
        })}
      </div>
    </div>
  );
}
