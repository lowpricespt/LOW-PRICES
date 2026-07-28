import axios, { AxiosError, type InternalAxiosRequestConfig } from 'axios';
import { env } from '@/config';
import { getAccessToken, refreshAccessToken, clearSession } from './auth-session';

/**
 * Cliente HTTP único da aplicação. Toda a comunicação com o backend NestJS
 * passa por aqui — nenhuma feature deve instanciar o seu próprio Axios.
 */
export const apiClient = axios.create({
  baseURL: env.NEXT_PUBLIC_API_URL,
  timeout: 15_000,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// --- Interceptor de pedido: injeta o access token, se existir ---
apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = getAccessToken();
  if (token) {
    config.headers.set('Authorization', `Bearer ${token}`);
  }
  return config;
});

// --- Interceptor de resposta: normaliza erros e prepara o refresh automático ---
let isRefreshing = false;
let pendingRequests: Array<() => void> = [];

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as (InternalAxiosRequestConfig & { _retry?: boolean }) | undefined;

    // Sem resposta do servidor (rede em baixo, timeout, CORS)
    if (!error.response) {
      return Promise.reject(
        normalizeError(error, 'Não foi possível contactar o servidor. Verifica a tua ligação.'),
      );
    }

    const { status } = error.response;

    // 401: tenta renovar a sessão uma única vez por pedido
    if (status === 401 && originalRequest && !originalRequest._retry) {
      originalRequest._retry = true;

      if (isRefreshing) {
        // Já há um refresh em curso: aguarda e repete o pedido original
        await new Promise<void>((resolve) => pendingRequests.push(resolve));
        return apiClient(originalRequest);
      }

      isRefreshing = true;
      try {
        await refreshAccessToken();
        pendingRequests.forEach((resolve) => resolve());
        pendingRequests = [];
        return apiClient(originalRequest);
      } catch {
        pendingRequests = [];
        clearSession();
        return Promise.reject(normalizeError(error, 'A tua sessão expirou. Inicia sessão novamente.'));
      } finally {
        isRefreshing = false;
      }
    }

    if (status === 403) {
      return Promise.reject(normalizeError(error, 'Não tens permissão para realizar esta ação.'));
    }

    if (status >= 500) {
      return Promise.reject(normalizeError(error, 'Ocorreu um erro no servidor. Tenta novamente.'));
    }

    return Promise.reject(normalizeError(error));
  },
);

export interface ApiError {
  status: number | null;
  message: string;
  details: unknown;
}

function normalizeError(error: AxiosError, fallbackMessage?: string): ApiError {
  const responseBody = error.response?.data as { message?: string | string[] } | undefined;
  const backendMessage = Array.isArray(responseBody?.message)
    ? responseBody?.message.join(', ')
    : responseBody?.message;

  return {
    status: error.response?.status ?? null,
    message: backendMessage ?? fallbackMessage ?? error.message,
    details: error.response?.data ?? null,
  };
}
