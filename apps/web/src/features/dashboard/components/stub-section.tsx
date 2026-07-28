import type { LucideIcon } from 'lucide-react';
import { Construction } from 'lucide-react';
import { EmptyState } from '@/components/ui';

export interface StubSectionProps {
  title: string;
  icon?: LucideIcon;
}

export function StubSection({ title, icon = Construction }: StubSectionProps) {
  return (
    <EmptyState
      icon={icon}
      title={`${title} — em construção`}
      description="Esta secção fica pronta num próximo bloco de desenvolvimento."
      className="min-h-[50vh]"
    />
  );
}
