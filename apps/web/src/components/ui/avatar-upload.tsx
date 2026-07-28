'use client';

import { useRef, useState } from 'react';
import Image from 'next/image';
import { Camera, RotateCcw } from 'lucide-react';
import { uploadFile, type UploadFolder } from '@/services/api/upload-api';
import { cn } from '@/lib/utils';

export interface AvatarUploadProps {
  currentUrl?: string | null;
  folder: UploadFolder;
  size?: number;
  onUploaded: (result: { url: string; key: string }) => void;
}

const MAX_SIZE_BYTES = 10 * 1024 * 1024;
const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

export function AvatarUpload({ currentUrl, folder, size = 96, onUploaded }: AvatarUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentUrl ?? null);
  const [progress, setProgress] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pendingFile, setPendingFile] = useState<File | null>(null);

  async function handleUpload(file: File) {
    setError(null);
    setPendingFile(file);

    if (!ACCEPTED_TYPES.includes(file.type)) {
      setError('Formato não suportado. Usa JPEG, PNG ou WebP.');
      return;
    }
    if (file.size > MAX_SIZE_BYTES) {
      setError('Ficheiro demasiado grande (máximo 10MB).');
      return;
    }

    const localPreview = URL.createObjectURL(file);
    setPreviewUrl(localPreview);
    setProgress(0);

    try {
      const result = await uploadFile(file, folder, setProgress);
      setPreviewUrl(result.thumbnailUrl ?? result.url);
      onUploaded({ url: result.url, key: result.key });
      setPendingFile(null);
    } catch {
      setError('Falha no upload. Tenta novamente.');
    } finally {
      setProgress(null);
    }
  }

  return (
    <div className="flex items-center gap-4">
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className={cn(
          'relative flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-secondary text-muted-foreground',
          'ring-1 ring-border transition-opacity hover:opacity-90',
        )}
        style={{ width: size, height: size }}
      >
        {previewUrl ? (
          <Image
            src={previewUrl}
            alt="Fotografia de perfil"
            fill
            sizes={`${size}px`}
            className="object-cover"
            unoptimized={previewUrl.startsWith('blob:')}
          />
        ) : (
          <Camera className="size-5" />
        )}
        {progress !== null ? (
          <div className="absolute inset-0 flex items-center justify-center bg-black/40 text-xs font-semibold text-white">
            {progress}%
          </div>
        ) : null}
      </button>

      <div>
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="text-sm font-medium text-primary hover:underline"
        >
          {previewUrl ? 'Alterar fotografia' : 'Adicionar fotografia'}
        </button>
        {error ? (
          <div className="mt-1 flex items-center gap-2 text-xs text-destructive">
            {error}
            {pendingFile ? (
              <button
                type="button"
                onClick={() => handleUpload(pendingFile)}
                className="flex items-center gap-1 font-medium underline"
              >
                <RotateCcw className="size-3" /> Tentar novamente
              </button>
            ) : null}
          </div>
        ) : (
          <p className="mt-1 text-xs text-muted-foreground">JPEG, PNG ou WebP, até 10MB.</p>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED_TYPES.join(',')}
        className="hidden"
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) handleUpload(file);
          event.target.value = '';
        }}
      />
    </div>
  );
}
