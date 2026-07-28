'use client';

import { useState } from 'react';
import { Camera } from 'lucide-react';
import { cn } from '@/lib/utils';

export function StepPhoto() {
  const [hasPhoto, setHasPhoto] = useState(false);

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold tracking-tight sm:text-3xl">
        Adiciona uma fotografia
      </h1>
      <p className="mt-2 text-muted-foreground">
        Perfis com fotografia geram mais confiança e mais pedidos aceites.
      </p>

      <button
        type="button"
        onClick={() => setHasPhoto(true)}
        className={cn(
          'mx-auto mt-8 flex size-32 flex-col items-center justify-center gap-2 rounded-full border-2 border-dashed text-muted-foreground transition-colors',
          hasPhoto ? 'border-primary bg-primary/10 text-primary' : 'border-border hover:border-primary/40',
        )}
      >
        <Camera className="size-6" />
        <span className="text-xs">{hasPhoto ? 'Foto adicionada' : 'Adicionar foto'}</span>
      </button>
    </div>
  );
}
