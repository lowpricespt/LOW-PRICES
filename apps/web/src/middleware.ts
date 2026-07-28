import { NextResponse, type NextRequest } from 'next/server';
import { isPrivateRoute, isAdminRoute } from '@/constants/routes';

const SESSION_COOKIE_NAME = 'lp_refresh_token';

/**
 * LIMITAÇÃO CONHECIDA (documentada em vez de escondida): o cookie
 * `lp_refresh_token` é definido pelo domínio da API (`apps/api`), não
 * pelo do website. Em desenvolvimento local (origens diferentes,
 * localhost:3000 vs localhost:3001) e em produção sem domínio partilhado,
 * o Next.js middleware NÃO consegue ler este cookie — cookies não são
 * partilhados entre origens diferentes.
 *
 * Por isso, nesta fase, a proteção de rotas *real* acontece no cliente,
 * via `useAuth()` (AuthProvider) em cada página privada, não aqui. Este
 * middleware fica pronto para quando a API e o Website partilharem
 * domínio em produção (ex.: `api.lowprices.pt` + `lowprices.pt`, cookie
 * com `domain: '.lowprices.pt'`) ou quando o Website passar a fazer
 * proxy dos pedidos via `next.config.ts` rewrites — nesse momento este
 * ficheiro passa a bloquear de facto, sem precisar de ser reescrito.
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hasSessionCookie = request.cookies.has(SESSION_COOKIE_NAME);

  if (isAdminRoute(pathname) && !hasSessionCookie) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirectTo', pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (isPrivateRoute(pathname) && !hasSessionCookie) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirectTo', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Corre em todas as rotas exceto:
     * - ficheiros estáticos (_next/static, _next/image)
     * - favicon e ficheiros de manifest/robots/sitemap
     */
    '/((?!_next/static|_next/image|favicon.ico|manifest.webmanifest|robots.txt|sitemap.xml).*)',
  ],
};
