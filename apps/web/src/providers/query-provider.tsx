'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';
import type { ApiError } from '@/services/api';

function isApiError(error: unknown): error is ApiError {
  return typeof error === 'object' && error !== null && 'status' in error;
}

function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000, // 1 minuto: evita refetch redundante entre navegações próximas
        retry: (failureCount, error) => {
          // Nunca repetir automaticamente erros de autenticação/permissão
          if (isApiError(error) && (error.status === 401 || error.status === 403)) return false;
          return failureCount < 2;
        },
        refetchOnWindowFocus: false,
      },
      mutations: {
        retry: false,
      },
    },
  });
}

// Um QueryClient por render do lado do servidor, mas reutilizado no browser
// (padrão recomendado pela própria documentação do TanStack Query com Next.js App Router).
let browserQueryClient: QueryClient | undefined;

function getQueryClient() {
  if (typeof window === 'undefined') {
    return createQueryClient();
  }
  if (!browserQueryClient) {
    browserQueryClient = createQueryClient();
  }
  return browserQueryClient;
}

export function QueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(getQueryClient);

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}
