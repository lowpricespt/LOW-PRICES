import { env } from './env';

export { env } from './env';

// Sem domínio próprio ainda (decisão deliberada — despesas por último),
// o site vive no domínio grátis da Vercel. Assim que houver domínio,
// definir NEXT_PUBLIC_SITE_URL no Vercel é a ÚNICA mudança necessária —
// nenhum ficheiro (metadata, sitemap, robots.txt) precisa de ser tocado.
const FALLBACK_SITE_URL = 'https://low-prices-web-delta.vercel.app';

export const appConfig = {
  name: 'Low Prices',
  description: 'A forma mais simples de encontrar profissionais de confiança perto de ti.',
  defaultLocale: 'pt-PT',
  supportedLocales: ['pt-PT'] as const,
  siteUrl: env.NEXT_PUBLIC_SITE_URL ?? FALLBACK_SITE_URL,
};