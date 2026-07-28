import type { MetadataRoute } from 'next';
import { appConfig } from '@/config';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        // '/conta', '/pedidos', '/mensagens', '/definicoes' eram nomes de
        // rotas de uma iteração anterior — as áreas privadas reais hoje
        // vivem todas debaixo de /dashboard e /registo/profissional
        // (dados por utilizador, sem valor de SEO e sem sentido indexar).
        disallow: ['/dashboard', '/registo/profissional/categorias', '/admin'],
      },
    ],
    sitemap: `${appConfig.siteUrl}/sitemap.xml`,
  };
}
