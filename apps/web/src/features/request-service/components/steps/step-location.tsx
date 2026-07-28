'use client';

import { MapPin } from 'lucide-react';
import { useRequestServiceStore } from '../../store/use-request-service-store';

export function StepLocation() {
  const location = useRequestServiceStore((state) => state.formData.location);
  const updateFormData = useRequestServiceStore((state) => state.updateFormData);

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold tracking-tight sm:text-3xl">
        Onde é o serviço?
      </h1>
      <p className="mt-2 text-muted-foreground">
        Usamos a localização para encontrar profissionais perto de ti.
      </p>

      <div className="mt-6 flex items-center gap-3 rounded-xl border border-input px-4 py-3 shadow-sm focus-within:ring-1 focus-within:ring-ring">
        <MapPin className="size-5 shrink-0 text-accent" />
        <input
          type="text"
          value={location}
          onChange={(event) => updateFormData({ location: event.target.value })}
          placeholder="Morada, freguesia ou código postal"
          className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
        />
      </div>
    </div>
  );
}
