'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Menu } from 'lucide-react';
import { LogoHorizontal } from '@/components/brand';
import {
  Button,
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
  DrawerClose,
  ThemeToggle,
} from '@/components/ui';

const NAV_LINKS = [
  { label: 'Como funciona', href: '#como-funciona' },
  { label: 'Categorias', href: '#categorias' },
  { label: 'Perguntas frequentes', href: '#faq' },
];

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur-md">
      <div className="container flex h-16 items-center justify-between gap-2">
        <Link href="/" aria-label="Página inicial da Low Prices" className="shrink-0">
          <LogoHorizontal markSize={30} />
        </Link>

        <nav className="hidden items-center gap-8 lg:flex">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="hidden items-center gap-1 md:flex">
          <ThemeToggle />
          <Button variant="ghost" size="sm" asChild>
            <Link href="/login">Entrar</Link>
          </Button>
          <Button variant="ghost" size="sm" className="hidden lg:inline-flex" asChild>
            <Link href="/registo">Criar conta</Link>
          </Button>
          <Button variant="secondary" size="sm" asChild>
            <Link href="/registo/profissional">Quero trabalhar</Link>
          </Button>
        </div>

        {/* Mobile: botão de menu abre um Drawer — mantém a navbar limpa no telemóvel */}
        <div className="flex items-center gap-1 md:hidden">
          <ThemeToggle />
          <Drawer open={isMenuOpen} onOpenChange={setIsMenuOpen}>
            <DrawerTrigger asChild>
              <Button variant="ghost" size="icon" aria-label="Abrir menu">
                <Menu className="size-5" />
              </Button>
            </DrawerTrigger>
            <DrawerContent side="right" className="w-[85%] sm:w-[80%]">
              <DrawerHeader>
                <DrawerTitle>Menu</DrawerTitle>
              </DrawerHeader>

              <nav className="flex flex-col gap-1">
                {NAV_LINKS.map((link) => (
                  <DrawerClose asChild key={link.href}>
                    <a
                      href={link.href}
                      className="rounded-lg px-3 py-3 text-base font-medium transition-colors hover:bg-secondary"
                    >
                      {link.label}
                    </a>
                  </DrawerClose>
                ))}
                <DrawerClose asChild>
                  <Link
                    href="/registo"
                    className="rounded-lg px-3 py-3 text-base font-medium transition-colors hover:bg-secondary"
                  >
                    Criar conta
                  </Link>
                </DrawerClose>
              </nav>

              <div className="mt-auto flex flex-col gap-2 pt-6">
                <DrawerClose asChild>
                  <Button variant="outline" size="lg" asChild>
                    <Link href="/login">Entrar</Link>
                  </Button>
                </DrawerClose>
                <DrawerClose asChild>
                  <Button size="lg" asChild>
                    <Link href="/registo/profissional">Quero trabalhar</Link>
                  </Button>
                </DrawerClose>
              </div>
            </DrawerContent>
          </Drawer>
        </div>
      </div>
    </header>
  );
}
