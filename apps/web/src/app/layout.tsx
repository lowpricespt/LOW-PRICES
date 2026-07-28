import type { Metadata, Viewport } from 'next';
import { Inter, Lexend } from 'next/font/google';
import { AppProviders } from '@/providers/app-providers';
import { appConfig } from '@/config';
import '@/styles/globals.css';

const fontSans = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
});

const fontDisplay = Lexend({
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
  weight: ['500', '600', '700'],
});

const siteUrl = appConfig.siteUrl;

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: `${appConfig.name} — Encontra profissionais de confiança perto de ti`,
    template: `%s — ${appConfig.name}`,
  },
  description: appConfig.description,
  keywords: [
    'serviços locais',
    'canalizador',
    'eletricista',
    'pintor',
    'jardineiro',
    'limpeza',
    'profissionais',
    'Portugal',
  ],
  authors: [{ name: appConfig.name }],
  creator: appConfig.name,
  openGraph: {
    type: 'website',
    locale: 'pt_PT',
    url: siteUrl,
    siteName: appConfig.name,
    title: `${appConfig.name} — Encontra profissionais de confiança perto de ti`,
    description: appConfig.description,
  },
  twitter: {
    card: 'summary_large_image',
    title: `${appConfig.name} — Encontra profissionais de confiança perto de ti`,
    description: appConfig.description,
  },
  manifest: '/manifest.webmanifest',
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#17181a' },
  ],
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-PT" suppressHydrationWarning className={`${fontSans.variable} ${fontDisplay.variable}`}>
      <body className="min-h-screen font-sans antialiased">
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
