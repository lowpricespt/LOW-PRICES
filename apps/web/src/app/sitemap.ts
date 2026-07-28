import type { MetadataRoute } from 'next';
import { appConfig } from '@/config';

const siteUrl = appConfig.siteUrl;

/**
 * Por agora só lista as rotas estáticas públicas. Quando as categorias
 * de serviço existirem na base de dados (Fase 4), esta função passa a
 * fazer fetch ao backend e a gerar uma entrada por categoria — a
 * assinatura da função mantém-se igual.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes = ['', '/login', '/registo', '/categorias', '/sobre', '/contacto'];

  return staticRoutes.map((route) => ({
    url: `${siteUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: route === '' ? 1 : 0.6,
  }));
}
