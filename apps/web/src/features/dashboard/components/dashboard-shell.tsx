'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu } from 'lucide-react';
import { LogoHorizontal } from '@/components/brand';
import { Button, Drawer, DrawerContent, DrawerClose, ThemeToggle } from '@/components/ui';
import {
  CLIENT_DASHBOARD_NAV,
  PROFESSIONAL_DASHBOARD_NAV,
  ADMIN_DASHBOARD_NAV,
  type DashboardNavItem,
} from '@/constants/dashboard-nav';
import { cn } from '@/lib/utils';

export type DashboardRole = 'client' | 'professional' | 'admin';

export interface DashboardShellProps {
  role: DashboardRole;
  children: React.ReactNode;
}

/**
 * Os itens de navegação (com o respetivo ícone) nunca chegam como prop
 * vinda de um Server Component — os ícones do lucide-react são
 * componentes (funções), e o Next.js/React não permite passar funções
 * como prop de Servidor para Cliente (só como JSX já renderizado).
 * Por isso este componente recebe só `role` (uma string, serializável)
 * e resolve a lista de navegação aqui dentro, que já é 100% cliente.
 */
const NAV_ITEMS_BY_ROLE: Record<DashboardRole, DashboardNavItem[]> = {
  client: CLIENT_DASHBOARD_NAV,
  professional: PROFESSIONAL_DASHBOARD_NAV,
  admin: ADMIN_DASHBOARD_NAV,
};

function NavLinks({
  navItems,
  pathname,
  onNavigate,
}: {
  navItems: DashboardNavItem[];
  pathname: string;
  onNavigate?: () => void;
}) {
  return (
    <nav className="flex flex-col gap-1">
      {navItems.map((item) => {
        const isActive = pathname === item.href;
        return (
          <Link
            key={item.id}
            href={item.href}
            onClick={onNavigate}
            className={cn(
              'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
              isActive
                ? 'bg-primary/10 text-primary'
                : 'text-muted-foreground hover:bg-secondary hover:text-foreground',
            )}
          >
            <item.icon className="size-[18px] shrink-0" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

export function DashboardShell({ role, children }: DashboardShellProps) {
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navItems = NAV_ITEMS_BY_ROLE[role];

  return (
    <div className="min-h-screen bg-background lg:flex">
      {/* Sidebar — desktop */}
      <aside className="hidden w-64 shrink-0 border-r border-border p-4 lg:block">
        <Link href="/" className="mb-6 block px-2">
          <LogoHorizontal markSize={28} />
        </Link>
        <NavLinks navItems={navItems} pathname={pathname} />
      </aside>

      <div className="flex-1">
        {/* Topbar — mobile e desktop */}
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border bg-background/90 px-4 backdrop-blur lg:justify-end">
          <Drawer open={isMenuOpen} onOpenChange={setIsMenuOpen}>
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setIsMenuOpen(true)}
              aria-label="Abrir menu"
            >
              <Menu className="size-5" />
            </Button>
            <DrawerContent side="left" className="w-[80%]">
              <Link href="/" className="mb-6 block px-1">
                <LogoHorizontal markSize={28} />
              </Link>
              <NavLinks navItems={navItems} pathname={pathname} onNavigate={() => setIsMenuOpen(false)} />
              <DrawerClose className="sr-only" />
            </DrawerContent>
          </Drawer>

          <ThemeToggle />
        </header>

        <main className="p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
