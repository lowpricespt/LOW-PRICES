'use client';

import { cn } from '@/lib/utils';
import { useRequestServiceStore } from '../../store/use-request-service-store';

// Tem de bater certo com CreateServiceRequestDto (apps/api/src/modules/requests/dto/create-service-request.dto.ts)
// — validar aqui à frente evita chegar ao último passo do wizard só para
// descobrir, via erro 400 do backend, que a descrição é demasiado curta.
export const DESCRIPTION_MIN_LENGTH = 10;
export const DESCRIPTION_MAX_LENGTH = 2000;

export function StepDetails() {
  const description = useRequestServiceStore((state) => state.formData.description);
  const updateFormData = useRequestServiceStore((state) => state.updateFormData);

  const trimmedLength = description.trim().length;
  const isTooShort = trimmedLength > 0 && trimmedLength < DESCRIPTION_MIN_LENGTH;

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
        onChange={(event) => updateFormData({ description: event.target.value.slice(0, DESCRIPTION_MAX_LENGTH) })}
        rows={6}
        maxLength={DESCRIPTION_MAX_LENGTH}
        placeholder="Ex.: Tenho uma fuga de água por baixo do lava-loiças na cozinha..."
        aria-invalid={isTooShort}
        className="mt-6 w-full resize-none rounded-xl border border-input bg-transparent p-4 text-sm shadow-sm outline-none placeholder:text-muted-foreground focus-visible:ring-1 focus-visible:ring-ring aria-invalid:border-destructive aria-invalid:ring-destructive/20"
      />

      <div className="mt-2 flex items-center justify-between text-xs">
        <span className={cn('text-muted-foreground', isTooShort && 'text-destructive')}>
          {isTooShort
            ? `Escreve pelo menos ${DESCRIPTION_MIN_LENGTH} caracteres (faltam ${DESCRIPTION_MIN_LENGTH - trimmedLength}).`
            : 'Quanto mais detalhes, melhor.'}
        </span>
        <span className="text-muted-foreground">
          {description.length}/{DESCRIPTION_MAX_LENGTH}
        </span>
      </div>

      {/* Nota de implementação: nesta fase o formulário é o mesmo para todas as
          categorias. Perguntas específicas por categoria (ex.: "quantas torneiras?"
          para Canalizador) entram quando o catálogo de categorias vier do backend. */}
    </div>
  );
}
