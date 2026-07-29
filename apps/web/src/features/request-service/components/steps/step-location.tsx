'use client';

import { MapPin } from 'lucide-react';
import { AddressAutocomplete, type ParsedGooglePlace } from '@/components/ui';
import { useRequestServiceStore } from '../../store/use-request-service-store';

export function StepLocation() {
  const location = useRequestServiceStore((state) => state.formData.location);
  const updateFormData = useRequestServiceStore((state) => state.updateFormData);

  function handlePlaceSelected(place: ParsedGooglePlace) {
    updateFormData({
      location: place.formattedAddress || location,
      latitude: place.latitude,
      longitude: place.longitude,
    });
  }

  function handleTextChange(value: string) {
    // Morada editada à mão depois de uma sugestão escolhida (ou sem
    // autocomplete disponível) deixa de corresponder às coordenadas
    // anteriores — evita gravar um pin desatualizado.
    updateFormData({ location: value, latitude: null, longitude: null });
  }

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
        <AddressAutocomplete
          value={location}
          onChange={handleTextChange}
          onPlaceSelected={handlePlaceSelected}
          placeholder="Morada, freguesia ou código postal"
          maxLength={200}
          className="w-full"
          inputClassName="h-auto border-0 bg-transparent p-0 shadow-none focus-visible:ring-0"
        />
      </div>
    </div>
  );
}
