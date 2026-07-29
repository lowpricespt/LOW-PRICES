import { NextResponse, type NextRequest } from 'next/server';

/**
 * BUG CRÍTICO corrigido aqui: este middleware costumava redirecionar para
 * /login sempre que não via o cookie `lp_refresh_token` — mas esse cookie
 * é definido pelo domínio da API (Railway), nunca pelo do Website
 * (Vercel). São domínios diferentes tanto em produção como em
 * desenvolvimento local, e cookies não são partilhados entre origens
 * diferentes — o middleware NUNCA via o cookie, mesmo com sessão válida.
 *
 * Resultado real: qualquer visita a uma rota `/dashboard/*` (incluindo o
 * redirect logo depois de criar conta ou entrar) era imediatamente
 * mandada de volta para /login pelo servidor, antes de o React sequer
 * montar — a app parecia "não guardar sessão nenhuma". O comentário
 * antigo já dizia "a proteção real acontece no cliente", mas o código
 * fazia o oposto: bloqueava no servidor primeiro.
 *
 * Por isso este middleware fica agora só como passagem (não decide nada
 * sobre sessão) — a proteção real está em `<RequireAuth>` (ver
 * features/auth/components/require-auth.tsx), usado nos layouts do
 * dashboard, que verifica a sessão no cliente via `useAuth()` (chama
 * /auth/refresh e /users/me com credentials, que FUNCIONA cross-domain
 * porque usa CORS com credentials, não um cookie lido pelo servidor).
 *
 * Quando a API e o Website partilharem domínio (ex.: `api.lowprices.pt` +
 * `lowprices.pt`, cookie com `domain: '.lowprices.pt'`), este ficheiro
 * pode voltar a fazer um redirect real no servidor — até lá, um redirect
 * "às cegas" faz mais mal do que bem.
 */
export function middleware(_request: NextRequest) {
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|manifest.webmanifest|robots.txt|sitemap.xml).*)',
  ],
};
