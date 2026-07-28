import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/conta', '/pedidos', '/mensagens', '/definicoes', '/admin'],
      },
    ],
    sitemap: 'https://lowprices.pt/sitemap.xml',
  };
}
