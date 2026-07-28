'use client';

import { useRequestServiceStore } from '../../store/use-request-service-store';

export function StepBudget() {
  const budget = useRequestServiceStore((state) => state.formData.budget);
  const updateFormData = useRequestServiceStore((state) => state.updateFormData);

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold tracking-tight sm:text-3xl">
        Tens um orçamento em mente?
      </h1>
      <p className="mt-2 text-muted-foreground">
        Opcional. Ajuda os profissionais a ajustarem a proposta — podes deixar em branco.
      </p>

      <div className="mt-6 flex items-center gap-3 rounded-xl border border-input px-4 py-3 shadow-sm focus-within:ring-1 focus-within:ring-ring">
        <span className="text-sm font-medium text-muted-foreground">€</span>
        <input
          type="text"
          inputMode="numeric"
          value={budget}
          onChange={(event) => updateFormData({ budget: event.target.value })}
          placeholder="Ex.: 50"
          className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
        />
      </div>
    </div>
  );
}
