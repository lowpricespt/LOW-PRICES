'use client';

import { cn } from '@/lib/utils';
import { WEEKDAYS } from '../../constants/steps';

export interface StepAvailabilityProps {
  selectedDays: string[];
  onToggleDay: (id: string) => void;
}

export function StepAvailability({ selectedDays, onToggleDay }: StepAvailabilityProps) {
  return (
    <div>
      <h1 className="font-display text-2xl font-semibold tracking-tight sm:text-3xl">
        Quando estás disponível?
      </h1>
      <p className="mt-2 text-muted-foreground">Podes ajustar isto mais tarde nas definições da conta.</p>

      <div className="mt-6 grid grid-cols-7 gap-2">
        {WEEKDAYS.map((day) => {
          const isSelected = selectedDays.includes(day.id);
          return (
            <button
              key={day.id}
              type="button"
              onClick={() => onToggleDay(day.id)}
              className={cn(
                'flex flex-col items-center gap-1 rounded-xl border py-3 text-xs font-medium transition-colors',
                isSelected
                  ? 'border-primary bg-primary/10 text-primary'
                  : 'border-border text-muted-foreground hover:border-primary/40',
              )}
            >
              {day.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
