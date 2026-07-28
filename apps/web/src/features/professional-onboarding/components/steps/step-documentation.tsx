'use client';

import { useState } from 'react';
import { FileCheck, Upload } from 'lucide-react';
import { cn } from '@/lib/utils';

const REQUIRED_DOCS = [
  { id: 'identidade', label: 'Cartão de Cidadão ou Passaporte' },
  { id: 'atividade', label: 'Comprovativo de atividade (recibos verdes ou empresa)' },
];

export function StepDocumentation() {
  const [uploaded, setUploaded] = useState<string[]>([]);

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold tracking-tight sm:text-3xl">
        Verificação de identidade
      </h1>
      <p className="mt-2 text-muted-foreground">
        Precisamos destes documentos para confirmar que és um profissional verificado.
      </p>

      <div className="mt-6 space-y-3">
        {REQUIRED_DOCS.map((doc) => {
          const isUploaded = uploaded.includes(doc.id);
          return (
            <button
              key={doc.id}
              type="button"
              onClick={() => setUploaded((prev) => [...prev, doc.id])}
              className={cn(
                'flex w-full items-center justify-between rounded-xl border px-4 py-3.5 text-left text-sm transition-colors',
                isUploaded ? 'border-success/40 bg-success/5' : 'border-border hover:border-primary/40',
              )}
            >
              <span className="font-medium">{doc.label}</span>
              {isUploaded ? (
                <FileCheck className="size-5 shrink-0 text-success" />
              ) : (
                <Upload className="size-5 shrink-0 text-muted-foreground" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
