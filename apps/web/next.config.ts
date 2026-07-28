import type { NextConfig } from 'next';

// Content-Security-Policy montada a partir de domínios conhecidos e usados
// de facto pela plataforma (Google Maps/Places, Cloudflare R2, Google
// OAuth). Em modo 'unsafe-inline'/'unsafe-eval' para script-src porque o
// Next.js precisa disso para hidratação e o Google Maps injeta scripts
// inline — reavaliar com nonces quando o CSP for endurecido (ver auditoria
// de lançamento). Testar sempre em Report-Only antes de aplicar a sério
// num domínio novo.
const csp = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://maps.googleapis.com https://accounts.google.com",
  "style-src 'self' 'unsafe-inline'",
  // https://*.r2.dev é o domínio público GRATUITO do R2 (sem custom
  // domain nem domínio próprio) — é o que se usa enquanto não houver
  // domínio comprado. https://*.r2.cloudflarestorage.com fica também
  // permitido para quando/se um domínio custom for configurado.
  "img-src 'self' data: blob: https://*.r2.dev https://*.r2.cloudflarestorage.com https://*.googleusercontent.com https://maps.gstatic.com https://maps.googleapis.com",
  "font-src 'self' data:",
  "connect-src 'self' https://*.r2.dev https://*.r2.cloudflarestorage.com https://maps.googleapis.com https://vercel.live " +
    (process.env.NEXT_PUBLIC_API_URL ?? ''),
  "frame-src 'self' https://accounts.google.com",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
]
  .join('; ')
  .replace(/\s+/g, ' ')
  .trim();

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.r2.cloudflarestorage.com',
      },
      {
        // Domínio público gratuito do R2 (pub-<hash>.r2.dev) — o que a
        // conta vai usar até haver um domínio próprio ligado ao bucket.
        protocol: 'https',
        hostname: '**.r2.dev',
      },
    ],
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(self), payment=(self), interest-cohort=()',
          },
          { key: 'X-DNS-Prefetch-Control', value: 'on' },
          { key: 'Content-Security-Policy', value: csp },
        ],
      },
    ];
  },
};

export default nextConfig;