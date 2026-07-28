'use client';

import { useServiceCategories } from '@/hooks/use-service-categories';
import { cn } from '@/lib/utils';

export interface StepCategoriesProps {
  selected: string[];
  onToggle: (categoryId: string) => void;
  error?: string | null;
}

export function StepCategories({ selected, onToggle, error }: StepCategoriesProps) {
  const { categories, isLoading } = useServiceCategories();

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold tracking-tight sm:text-3xl">
        Em que categorias trabalhas?
      </h1>
      <p className="mt-2 text-muted-foreground">Podes escolher mais do que uma — isto decide que pedidos vês.</p>

      {error ? (
        <p className="mt-4 rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</p>
      ) : null}

      {isLoading && <p className="mt-6 text-sm text-muted-foreground">A carregar categorias…</p>}

      <div className="mt-6 flex flex-wrap gap-2">
        {categories.map((category) => {
          const isSelected = selected.includes(category.id);
          return (
            <button
              key={category.id}
              type="button"
              onClick={() => onToggle(category.id)}
              className={cn(
                'flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-colors',
                isSelected
                  ? 'border-primary bg-primary/10 text-primary'
                  : 'border-border text-muted-foreground hover:border-primary/40',
              )}
            >
              <category.icon className="size-4" />
              {category.name}
            </button>
          );
        })}
      </div>
    </div>
  );
}
