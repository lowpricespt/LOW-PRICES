import Link from 'next/link';
import { LogoHorizontal } from '@/components/brand';
import { Card } from '@/components/ui';

export interface AuthLayoutProps {
  title: string;
  description: string;
  children: React.ReactNode;
  footer: React.ReactNode;
}

export function AuthLayout({ title, description, children, footer }: AuthLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-secondary/40 px-4 py-10 sm:px-6">
      <Link href="/" className="mb-8">
        <LogoHorizontal markSize={32} />
      </Link>

      <Card className="w-full max-w-sm rounded-2xl p-6 shadow-sm sm:p-8">
        <div className="mb-6 text-center">
          <h1 className="font-display text-xl font-semibold tracking-tight sm:text-2xl">{title}</h1>
          <p className="mt-1.5 text-sm text-muted-foreground">{description}</p>
        </div>

        {children}
      </Card>

      <p className="mt-6 text-sm text-muted-foreground">{footer}</p>
    </div>
  );
}
