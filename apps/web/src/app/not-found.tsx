import Link from 'next/link';
import { CompassIcon } from 'lucide-react';
import { EmptyState, Button } from '@/components/ui';

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center px-6">
      <EmptyState
        icon={CompassIcon}
        title="Esta página não existe"
        description="O endereço pode estar incorreto ou a página pode ter sido movida."
        action={
          <Button asChild size="sm">
            <Link href="/">Voltar ao início</Link>
          </Button>
        }
      />
    </div>
  );
}
