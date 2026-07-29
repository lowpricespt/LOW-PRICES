'use client';

import { useState } from 'react';
import { AvatarUpload } from '@/components/ui';
import { updateProfileRequest } from '@/features/profile/services/profile-api';

export function StepPhoto() {
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);

  async function handleUploaded(result: { url: string }) {
    setAvatarUrl(result.url);
    setSaveError(null);
    try {
      await updateProfileRequest({ avatarUrl: result.url });
    } catch {
      setSaveError('A foto foi enviada, mas não foi possível associá-la ao perfil. Tenta novamente.');
    }
  }

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold tracking-tight sm:text-3xl">
        Adiciona uma fotografia
      </h1>
      <p className="mt-2 text-muted-foreground">
        Perfis com fotografia geram mais confiança e mais pedidos aceites.
      </p>

      <div className="mt-8 flex justify-center">
        <AvatarUpload currentUrl={avatarUrl} folder="avatars" size={128} onUploaded={handleUploaded} />
      </div>
      {saveError ? <p className="mt-3 text-center text-sm text-destructive">{saveError}</p> : null}
    </div>
  );
}
