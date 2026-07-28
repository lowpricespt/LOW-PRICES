'use client';

import { Camera, X } from 'lucide-react';
import { useRequestServiceStore } from '../../store/use-request-service-store';

const MAX_PHOTOS = 6;

export function StepPhotos() {
  const photoCount = useRequestServiceStore((state) => state.formData.photoCount);
  const updateFormData = useRequestServiceStore((state) => state.updateFormData);

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold tracking-tight sm:text-3xl">
        Adiciona fotografias
      </h1>
      <p className="mt-2 text-muted-foreground">
        Opcional, mas ajuda os profissionais a perceberem melhor o trabalho. Até {MAX_PHOTOS} fotos.
      </p>

      <div className="mt-6 grid grid-cols-3 gap-3">
        {Array.from({ length: photoCount }).map((_, index) => (
          <div
            key={index}
            className="relative flex aspect-square items-center justify-center rounded-xl bg-secondary text-xs text-muted-foreground"
          >
            Foto {index + 1}
            <button
              type="button"
              onClick={() => updateFormData({ photoCount: Math.max(0, photoCount - 1) })}
              className="absolute right-1.5 top-1.5 flex size-6 items-center justify-center rounded-full bg-background/90 text-foreground shadow"
              aria-label="Remover fotografia"
            >
              <X className="size-3.5" />
            </button>
          </div>
        ))}

        {photoCount < MAX_PHOTOS && (
          <button
            type="button"
            onClick={() => updateFormData({ photoCount: photoCount + 1 })}
            className="flex aspect-square flex-col items-center justify-center gap-1.5 rounded-xl border border-dashed border-border text-muted-foreground transition-colors hover:border-primary/40 hover:text-primary"
          >
            <Camera className="size-5" />
            <span className="text-xs">Adicionar</span>
          </button>
        )}
      </div>
    </div>
  );
}
