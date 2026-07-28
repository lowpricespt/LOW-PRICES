import { env } from '@/config';

/**
 * Tipagem mínima do subconjunto da API do Google Maps que usamos
 * (Places Autocomplete clássico, via Maps JavaScript API). Escrita à mão
 * em vez de instalar `@types/google.maps` para não trazer nenhuma
 * dependência nova — o script em si já é carregado por <script> dinâmica,
 * nunca via npm.
 */
export interface GoogleMapsAddressComponent {
  long_name: string;
  short_name: string;
  types: string[];
}

export interface GoogleMapsPlaceResult {
  address_components?: GoogleMapsAddressComponent[];
  formatted_address?: string;
  geometry?: {
    location?: {
      lat: () => number;
      lng: () => number;
    };
  };
}

export interface GoogleMapsAutocomplete {
  addListener(eventName: 'place_changed', handler: () => void): { remove: () => void };
  getPlace(): GoogleMapsPlaceResult;
}

export interface GoogleMapsNamespace {
  maps: {
    places: {
      Autocomplete: new (
        input: HTMLInputElement,
        options?: {
          componentRestrictions?: { country: string | string[] };
          fields?: string[];
          types?: string[];
        },
      ) => GoogleMapsAutocomplete;
    };
    event: {
      clearInstanceListeners: (instance: unknown) => void;
    };
  };
}

declare global {
  interface Window {
    google?: GoogleMapsNamespace;
    gm_authFailure?: () => void;
  }
}

const SCRIPT_ID = 'google-maps-places-script';

let loaderPromise: Promise<GoogleMapsNamespace> | null = null;

/**
 * Carrega a Maps JavaScript API (biblioteca "places") uma única vez por
 * sessão de página. Rejeita (nunca lança de forma não tratada) quando a
 * chave falta, a Google recusa a chave (`gm_authFailure` — restrições/
 * faturação) ou o script falha a carregar — quem chama decide o fallback
 * honesto para inputs de texto simples.
 */
export function loadGoogleMapsPlaces(): Promise<GoogleMapsNamespace> {
  if (typeof window === 'undefined') {
    return Promise.reject(new Error('Google Maps só pode ser carregado no browser.'));
  }
  if (window.google?.maps?.places) {
    return Promise.resolve(window.google);
  }
  if (loaderPromise) {
    return loaderPromise;
  }

  const apiKey = env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  if (!apiKey) {
    return Promise.reject(new Error('NEXT_PUBLIC_GOOGLE_MAPS_API_KEY não está configurada.'));
  }

  loaderPromise = new Promise<GoogleMapsNamespace>((resolve, reject) => {
    window.gm_authFailure = () => {
      reject(
        new Error(
          'A Google recusou a chave da Maps API (verifica restrições de domínio, faturação ou se a Places API está ativada).',
        ),
      );
    };

    const existing = document.getElementById(SCRIPT_ID) as HTMLScriptElement | null;
    if (existing) {
      existing.addEventListener('load', () => {
        if (window.google?.maps?.places) resolve(window.google);
        else reject(new Error('Google Maps carregado mas a biblioteca "places" não ficou disponível.'));
      });
      existing.addEventListener('error', () => reject(new Error('Não foi possível carregar o script do Google Maps.')));
      return;
    }

    const script = document.createElement('script');
    script.id = SCRIPT_ID;
    script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(apiKey)}&libraries=places&loading=async`;
    script.async = true;
    script.defer = true;
    script.onload = () => {
      if (window.google?.maps?.places) resolve(window.google);
      else reject(new Error('Google Maps carregado mas a biblioteca "places" não ficou disponível.'));
    };
    script.onerror = () => reject(new Error('Não foi possível carregar o script do Google Maps.'));
    document.head.appendChild(script);
  }).catch((error: unknown) => {
    // Permite que uma tentativa futura (ex.: noutra página) volte a tentar
    // em vez de ficar presa numa promise rejeitada para sempre.
    loaderPromise = null;
    throw error;
  });

  return loaderPromise;
}
