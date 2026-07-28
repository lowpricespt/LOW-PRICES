/**
 * Rotas acessíveis sem autenticação.
 * Usa prefixos: qualquer rota que comece por um destes valores é considerada pública.
 */
export const PUBLIC_ROUTES = ['/', '/login', '/registo', '/categorias', '/sobre', '/contacto'] as const;

/**
 * Rotas que exigem sessão iniciada.
 * Serão validadas pelo middleware assim que o AuthProvider real existir (Fase 3).
 */
export const PRIVATE_ROUTE_PREFIXES = ['/dashboard', '/registo/profissional/categorias'] as const;

/**
 * Rotas exclusivas do painel de administração.
 */
export const ADMIN_ROUTE_PREFIXES = ['/admin'] as const;

export function isPublicRoute(pathname: string): boolean {
  return PUBLIC_ROUTES.some((route) => pathname === route);
}

export function isPrivateRoute(pathname: string): boolean {
  return PRIVATE_ROUTE_PREFIXES.some((prefix) => pathname.startsWith(prefix));
}

export function isAdminRoute(pathname: string): boolean {
  return ADMIN_ROUTE_PREFIXES.some((prefix) => pathname.startsWith(prefix));
}
