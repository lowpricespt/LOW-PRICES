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

// BUG CRÍTICO corrigido aqui: o AuthProvider dispara um refresh silencioso
// ao montar (restaurar sessão a partir do cookie). Se o utilizador fizer
// login/registo manualmente ANTES desse refresh silencioso responder (ex.:
// tinha uma sessão antiga válida no browser e cria uma conta nova a
// seguir), a resposta tardia do refresh sobrepunha-se ao login manual —
// a app ficava autenticada como a conta ERRADA (a antiga), sem erro
// nenhum visível. `generation` incrementa em cada mudança de sessão
// (login, registo, refresh bem-sucedido, logout); `refreshAccessToken`
// só aplica o token que obteve se ninguém mudou a sessão entretanto.
let generation = 0;

export function getAccessToken(): string | null {
  return accessToken;
}

export function setAccessToken(token: string | null): void {
  accessToken = token;
  generation += 1;
}

export function clearSession(): void {
  accessToken = null;
  generation += 1;
}

/**
 * Chamado automaticamente pelo interceptor de resposta do axios.ts
 * quando a API devolve 401. Usa uma instância de Axios separada (sem os
 * interceptors do apiClient) para nunca entrar num ciclo infinito de
 * refresh-de-refresh.
 */
export async function refreshAccessToken(): Promise<void> {
  const startGeneration = generation;
  const response = await axios.post<{ accessToken: string }>(
    `${env.NEXT_PUBLIC_API_URL}/auth/refresh`,
    {},
    { withCredentials: true },
  );
  if (generation !== startGeneration) {
    // Uma autenticação manual (login/registo/logout) aconteceu enquanto
    // este refresh estava em curso — esta resposta chegou tarde e já não
    // é a sessão atual; aplicá-la na mesma trocava o utilizador autenticado
    // sem o utilizador pedir nada.
    return;
  }
  setAccessToken(response.data.accessToken);
}
