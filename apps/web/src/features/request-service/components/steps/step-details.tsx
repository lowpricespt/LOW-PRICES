'use client';

import { useRequestServiceStore } from '../../store/use-request-service-store';

export function StepDetails() {
  const description = useRequestServiceStore((state) => state.formData.description);
  const updateFormData = useRequestServiceStore((state) => state.updateFormData);

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold tracking-tight sm:text-3xl">
        Descreve o que precisas
      </h1>
      <p className="mt-2 text-muted-foreground">
        Quanto mais detalhes deres, melhores serão os orçamentos que vais receber.
      </p>

      <textarea
        value={description}
        onChange={(event) => updateFormData({ description: event.target.value })}
        rows={6}
        placeholder="Ex.: Tenho uma fuga de água por baixo do lava-loiças na cozinha..."
        className="mt-6 w-full resize-none rounded-xl border border-input bg-transparent p-4 text-sm shadow-sm outline-none placeholder:text-muted-foreground focus-visible:ring-1 focus-visible:ring-ring"
      />

      {/* Nota de implementação: nesta fase o formulário é o mesmo para todas as
          categorias. Perguntas específicas por categoria (ex.: "quantas torneiras?"
          para Canalizador) entram quando o catálogo de categorias vier do backend. */}
    </div>
  );
}
