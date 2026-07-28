import Link from 'next/link';
import { LogoHorizontal } from '@/components/brand';

const FOOTER_COLUMNS = [
  {
    title: 'Produto',
    links: [
      { label: 'Como funciona', href: '#como-funciona' },
      { label: 'Categorias', href: '#categorias' },
      { label: 'Para profissionais', href: '/registo/profissional' },
    ],
  },
  {
    title: 'Empresa',
    links: [
      { label: 'Sobre nós', href: '/sobre' },
      { label: 'Contacto', href: '/contacto' },
    ],
  },
  {
    title: 'Legal',
    links: [
      { label: 'Termos de serviço', href: '/termos' },
      { label: 'Privacidade', href: '/privacidade' },
    ],
  },
];

export function Footer() {
  return (
    <footer className="border-t border-border py-16">
      <div className="container grid gap-12 md:grid-cols-[1.2fr_2fr]">
        <div>
          <LogoHorizontal markSize={28} />
          <p className="mt-4 max-w-xs text-sm text-muted-foreground">
            A forma mais simples de encontrar profissionais de confiança perto de ti.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-8 sm:grid-cols-3">
          {FOOTER_COLUMNS.map((column) => (
            <div key={column.title}>
              <p className="text-sm font-semibold">{column.title}</p>
              <ul className="mt-4 space-y-3">
                {column.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      <div className="container mt-12 border-t border-border pt-6 text-xs text-muted-foreground">
        © {new Date().getFullYear()} Low Prices. Todos os direitos reservados.
      </div>
    </footer>
  );
}
