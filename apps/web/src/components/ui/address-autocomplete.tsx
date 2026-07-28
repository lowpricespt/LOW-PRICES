'use client';

import { useEffect, useRef, useState } from 'react';
import { Input, type InputProps } from './input';
import {
  loadGoogleMapsPlaces,
  type GoogleMapsAutocomplete,
  type GoogleMapsPlaceResult,
} from '@/lib/google-maps-loader';

export interface ParsedGooglePlace {
  formattedAddress: string;
  line1: string;
  postalCode: string;
  city: string;
  latitude: number | null;
  longitude: number | null;
}

function parseGooglePlace(place: GoogleMapsPlaceResult): ParsedGooglePlace {
  const components = place.address_components ?? [];
  const find = (type: string) => components.find((component) => component.types.includes(type));

  const streetNumber = find('street_number')?.long_name ?? '';
  const route = find('route')?.long_name ?? '';
  const postalCode = find('postal_code')?.long_name ?? '';
  const postalCodeSuffix = find('postal_code_suffix')?.long_name ?? '';
  const city =
    find('locality')?.long_name ??
    find('postal_town')?.long_name ??
    find('administrative_area_level_2')?.long_name ??
    find('administrative_area_level_1')?.long_name ??
    '';

  const line1 = [route, streetNumber].filter(Boolean).join(', ') || place.formatted_address || '';

  return {
    formattedAddress: place.formatted_address ?? line1,
    line1,
    postalCode: postalCodeSuffix ? `${postalCode}-${postalCodeSuffix}` : postalCode,
    city,
    latitude: place.geometry?.location ? place.geometry.location.lat() : null,
    longitude: place.geometry?.location ? place.geometry.location.lng() : null,
  };
}

export interface AddressAutocompleteProps extends Omit<InputProps, 'onChange' | 'value' | 'className'> {
  value: string;
  onChange: (value: string) => void;
  onPlaceSelected: (place: ParsedGooglePlace) => void;
  /** Classe do <div> à volta do input (layout — grid span, largura, etc.). */
  className?: string;
  /** Classe do <input> em si — usar para sobrepor a moldura por omissão quando o input já vive dentro de outro container com borda. */
  inputClassName?: string;
}

/**
 * Input de morada com sugestões reais (Google Places Autocomplete,
 * biblioteca "places" da Maps JavaScript API). Funciona sempre como um
 * <Input> normal — quando a chave falta, a API recusa, ou o script falha
 * a carregar, degrada de forma honesta: mostra um aviso e deixa o
 * utilizador escrever a morada à mão, sem fingir que o autocomplete
 * está ativo nem bloquear o formulário.
 */
export function AddressAutocomplete({
  value,
  onChange,
  onPlaceSelected,
  placeholder,
  className,
  inputClassName,
  ...props
}: AddressAutocompleteProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const autocompleteRef = useRef<GoogleMapsAutocomplete | null>(null);
  const onChangeRef = useRef(onChange);
  const onPlaceSelectedRef = useRef(onPlaceSelected);
  const [status, setStatus] = useState<'loading' | 'ready' | 'unavailable'>('loading');

  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  useEffect(() => {
    onPlaceSelectedRef.current = onPlaceSelected;
  }, [onPlaceSelected]);

  useEffect(() => {
    let cancelled = false;

    loadGoogleMapsPlaces()
      .then((google) => {
        if (cancelled || !inputRef.current) return;
        const autocomplete = new google.maps.places.Autocomplete(inputRef.current, {
          componentRestrictions: { country: 'pt' },
          fields: ['address_components', 'geometry', 'formatted_address'],
          types: ['address'],
        });
        autocompleteRef.current = autocomplete;
        autocomplete.addListener('place_changed', () => {
          const place = autocomplete.getPlace();
          if (!place.address_components || place.address_components.length === 0) return;
          const parsed = parseGooglePlace(place);
          onChangeRef.current(parsed.formattedAddress);
          onPlaceSelectedRef.current(parsed);
        });
        setStatus('ready');
      })
      .catch((error: unknown) => {
        if (cancelled) return;
        console.warn('[AddressAutocomplete] indisponível:', error instanceof Error ? error.message : error);
        setStatus('unavailable');
      });

    return () => {
      cancelled = true;
      if (autocompleteRef.current && typeof window !== 'undefined' && window.google?.maps?.event) {
        window.google.maps.event.clearInstanceListeners(autocompleteRef.current);
      }
      autocompleteRef.current = null;
    };
  }, []);

  return (
    <div className={className}>
      <Input
        ref={inputRef}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className={inputClassName}
        autoComplete="off"
        {...props}
      />
      {status === 'unavailable' && (
        <p className="mt-1 text-xs text-muted-foreground">
          Sugestões automáticas de morada indisponíveis agora — escreve a morada manualmente.
        </p>
      )}
    </div>
  );
}
