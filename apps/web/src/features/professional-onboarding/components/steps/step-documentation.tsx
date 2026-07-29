'use client';

import { useRef, useState } from 'react';
import { FileCheck, Loader2, RotateCcw, Upload } from 'lucide-react';
import { cn } from '@/lib/utils';
import { uploadFile } from '@/services/api/upload-api';
import { upsertDocument, type ProfessionalDocumentType } from '@/features/dashboard/services/documents-api';
import type { ApiError } from '@/services/api';

const REQUIRED_DOCS: { id: ProfessionalDocumentType; label: string }[] = [
  { id: 'IDENTITY', label: 'Cartão de Cidadão ou Passaporte' },
  { id: 'PROOF_OF_ACTIVITY', label: 'Comprovativo de atividade (recibos verdes ou empresa)' },
];

const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
const MAX_SIZE_BYTES = 10 * 1024 * 1024;

type DocState = 'idle' | 'uploading' | 'uploaded' | 'error';

export function StepDocumentation() {
  const [state, setState] = useState<Record<ProfessionalDocumentType, { status: DocState; error?: string }>>({
    IDENTITY: { status: 'idle' },
    PROOF_OF_ACTIVITY: { status: 'idle' },
    CERTIFICATE: { status: 'idle' },
  });
  const inputRefs = useRef<Partial<Record<ProfessionalDocumentType, HTMLInputElement | null>>>({});

  async function handleFileSelected(type: ProfessionalDocumentType, file: File | undefined) {
    if (!file) return;

    if (!ACCEPTED_TYPES.includes(file.type)) {
      setState((current) => ({
        ...current,
        [type]: { status: 'error', error: 'Formato não suportado. Usa JPEG, PNG, WebP ou PDF.' },
      }));
      return;
    }
    if (file.size > MAX_SIZE_BYTES) {
      setState((current) => ({ ...current, [type]: { status: 'error', error: 'Ficheiro demasiado grande (máximo 10MB).' } }));
      return;
    }

    setState((current) => ({ ...current, [type]: { status: 'uploading' } }));
    try {
      const { key } = await uploadFile(file, 'documents');
      await upsertDocument(type, key);
      setState((current) => ({ ...current, [type]: { status: 'uploaded' } }));
    } catch (err) {
      const message = (err as ApiError).message ?? 'Não foi possível enviar este documento.';
      setState((current) => ({ ...current, [type]: { status: 'error', error: message } }));
    }
  }

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
          const docState = state[doc.id];
          return (
            <div key={doc.id}>
              <button
                type="button"
                disabled={docState.status === 'uploading'}
                onClick={() => inputRefs.current[doc.id]?.click()}
                className={cn(
                  'flex w-full items-center justify-between rounded-xl border px-4 py-3.5 text-left text-sm transition-colors',
                  docState.status === 'uploaded'
                    ? 'border-success/40 bg-success/5'
                    : docState.status === 'error'
                      ? 'border-destructive/40 bg-destructive/5'
                      : 'border-border hover:border-primary/40',
                )}
              >
                <span className="font-medium">{doc.label}</span>
                {docState.status === 'uploading' ? (
                  <Loader2 className="size-5 shrink-0 animate-spin text-muted-foreground" />
                ) : docState.status === 'uploaded' ? (
                  <FileCheck className="size-5 shrink-0 text-success" />
                ) : (
                  <Upload className="size-5 shrink-0 text-muted-foreground" />
                )}
              </button>
              {docState.status === 'error' && docState.error ? (
                <p className="mt-1.5 flex items-center gap-1.5 text-xs text-destructive">
                  {docState.error}
                  <button
                    type="button"
                    onClick={() => inputRefs.current[doc.id]?.click()}
                    className="flex items-center gap-1 font-medium underline"
                  >
                    <RotateCcw className="size-3" /> Tentar novamente
                  </button>
                </p>
              ) : null}
              <input
                ref={(element) => {
                  inputRefs.current[doc.id] = element;
                }}
                type="file"
                accept={ACCEPTED_TYPES.join(',')}
                className="hidden"
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  handleFileSelected(doc.id, file);
                  event.target.value = '';
                }}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
