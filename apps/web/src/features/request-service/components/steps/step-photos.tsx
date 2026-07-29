'use client';

import { useRef, useState } from 'react';
import Image from 'next/image';
import { Camera, Loader2, RotateCcw, X } from 'lucide-react';
import { uploadFile } from '@/services/api/upload-api';
import type { ApiError } from '@/services/api';
import { useRequestServiceStore } from '../../store/use-request-service-store';

const MAX_PHOTOS = 6;
const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_SIZE_BYTES = 10 * 1024 * 1024;

interface PendingUpload {
  id: string;
  file: File;
  previewUrl: string;
  error: string | null;
}

export function StepPhotos() {
  const photoUrls = useRequestServiceStore((state) => state.formData.photoUrls);
  const updateFormData = useRequestServiceStore((state) => state.updateFormData);
  const [pending, setPending] = useState<PendingUpload[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  const slotsLeft = MAX_PHOTOS - photoUrls.length - pending.length;

  function addUploadedUrl(url: string) {
    const current = useRequestServiceStore.getState().formData.photoUrls;
    updateFormData({ photoUrls: [...current, url] });
  }

  async function startUpload(item: PendingUpload) {
    try {
      const result = await uploadFile(item.file, 'request-photos');
      setPending((current) => current.filter((entry) => entry.id !== item.id));
      URL.revokeObjectURL(item.previewUrl);
      addUploadedUrl(result.url);
    } catch (err) {
      const message = (err as ApiError).message ?? 'Não foi possível enviar esta foto.';
      setPending((current) =>
        current.map((entry) => (entry.id === item.id ? { ...entry, error: message } : entry)),
      );
    }
  }

  function handleFilesSelected(event: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []).slice(0, Math.max(0, slotsLeft));
    event.target.value = '';

    for (const file of files) {
      if (!ACCEPTED_TYPES.includes(file.type)) {
        continue;
      }
      const id = `${Date.now()}-${Math.random()}`;
      const item: PendingUpload = {
        id,
        file,
        previewUrl: URL.createObjectURL(file),
        error: file.size > MAX_SIZE_BYTES ? 'Ficheiro demasiado grande (máximo 10MB).' : null,
      };
      setPending((current) => [...current, item]);
      if (!item.error) {
        startUpload(item);
      }
    }
  }

  function removePending(id: string) {
    setPending((current) => {
      const item = current.find((entry) => entry.id === id);
      if (item) URL.revokeObjectURL(item.previewUrl);
      return current.filter((entry) => entry.id !== id);
    });
  }

  function removeUploaded(url: string) {
    updateFormData({ photoUrls: photoUrls.filter((item) => item !== url) });
  }

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold tracking-tight sm:text-3xl">
        Adiciona fotografias
      </h1>
      <p className="mt-2 text-muted-foreground">
        Opcional, mas ajuda os profissionais a perceberem melhor o trabalho. Até {MAX_PHOTOS} fotos.
      </p>

      <div className="mt-6 grid grid-cols-3 gap-3">
        {photoUrls.map((url) => (
          <div key={url} className="relative aspect-square overflow-hidden rounded-xl bg-secondary">
            <Image src={url} alt="" fill sizes="150px" className="object-cover" />
            <button
              type="button"
              onClick={() => removeUploaded(url)}
              className="absolute right-1.5 top-1.5 flex size-6 items-center justify-center rounded-full bg-background/90 text-foreground shadow"
              aria-label="Remover fotografia"
            >
              <X className="size-3.5" />
            </button>
          </div>
        ))}

        {pending.map((item) => (
          <div key={item.id} className="relative aspect-square overflow-hidden rounded-xl bg-secondary">
            <Image src={item.previewUrl} alt="" fill sizes="150px" unoptimized className="object-cover" />
            {item.error ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-1.5 bg-background/95 p-2 text-center">
                <p className="text-[11px] text-destructive">{item.error}</p>
                <button
                  type="button"
                  onClick={() => removePending(item.id)}
                  className="flex items-center gap-1 text-[11px] font-medium text-primary underline"
                >
                  <RotateCcw className="size-3" /> Remover
                </button>
              </div>
            ) : (
              <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                <Loader2 className="size-5 animate-spin text-white" />
              </div>
            )}
          </div>
        ))}

        {slotsLeft > 0 && (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="flex aspect-square flex-col items-center justify-center gap-1.5 rounded-xl border border-dashed border-border text-muted-foreground transition-colors hover:border-primary/40 hover:text-primary"
          >
            <Camera className="size-5" />
            <span className="text-xs">Adicionar</span>
          </button>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED_TYPES.join(',')}
        multiple
        className="hidden"
        onChange={handleFilesSelected}
      />
    </div>
  );
}
