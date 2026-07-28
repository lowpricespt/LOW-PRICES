import axios from 'axios';
import { env } from '@/config';

/**
 * Estado de sessão usado pelo cliente Axios (src/services/api/axios.ts).
 *
 * O access token vive só em memória (nunca em localStorage — evita
 * exposição a XSS). O refresh token nunca é tocado por este ficheiro:
 * vive num cookie httpOnly definido pelo próprio backend, o browser
 * envia-o automaticamente em qualquer pedido a /auth/*.
 */

let accessToken: string | null = null;

export function getAccessToken(): string | null {
  return accessToken;
}

export function setAccessToken(token: string | null): void {
  accessToken = token;
}

export function clearSession(): void {
  accessToken = null;
}

/**
 * Chamado automaticamente pelo interceptor de resposta do axios.ts
 * quando a API devolve 401. Usa uma instância de Axios separada (sem os
 * interceptors do apiClient) para nunca entrar num ciclo infinito de
 * refresh-de-refresh.
 */
export async function refreshAccessToken(): Promise<void> {
  const response = await axios.post<{ accessToken: string }>(
    `${env.NEXT_PUBLIC_API_URL}/auth/refresh`,
    {},
    { withCredentials: true },
  );
  setAccessToken(response.data.accessToken);
}
