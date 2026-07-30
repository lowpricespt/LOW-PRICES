'use client';

import { AddressAutocomplete, type ParsedGooglePlace } from '@/components/ui/address-autocomplete';

export interface StepLocationProps {
  location: string;
  onLocationChange: (location: string) => void;
  onPlaceSelected: (place: ParsedGooglePlace) => void;
}

export function StepLocation({ location, onLocationChange, onPlaceSelected }: StepLocationProps) {
  return (
    <div>
      <h1 className="font-display text-2xl font-semibold tracking-tight sm:text-3xl">
        Onde estás localizado?
      </h1>
      <p className="mt-2 text-muted-foreground">Usamos isto em conjunto com o teu raio de atuação.</p>

      <AddressAutocomplete
        className="mt-6"
        value={location}
        onChange={onLocationChange}
        onPlaceSelected={onPlaceSelected}
        placeholder="Morada, freguesia ou código postal"
      />
    </div>
  );
}
