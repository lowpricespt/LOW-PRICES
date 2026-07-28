'use client';

import { useServiceCategories } from '@/hooks/use-service-categories';
import { cn } from '@/lib/utils';
import { useRequestServiceStore } from '../../store/use-request-service-store';

export function StepCategory() {
  const categoryId = useRequestServiceStore((state) => state.formData.categoryId);
  const updateFormData = useRequestServiceStore((state) => state.updateFormData);
  const { categories, isLoading } = useServiceCategories();

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold tracking-tight sm:text-3xl">
        Que serviço precisas?
      </h1>
      <p className="mt-2 text-muted-foreground">Escolhe a categoria que melhor descreve o teu pedido.</p>

      {isLoading && <p className="mt-8 text-sm text-muted-foreground">A carregar categorias…</p>}

      <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3">
        {categories.map((category) => {
          const isSelected = categoryId === category.id;
          return (
            <button
              key={category.id}
              type="button"
              onClick={() => updateFormData({ categoryId: category.id })}
              className={cn(
                'flex flex-col items-center gap-2.5 rounded-2xl border p-5 text-center transition-colors',
                isSelected
                  ? 'border-primary bg-primary/5 ring-1 ring-primary'
                  : 'border-border hover:border-primary/40 hover:bg-primary/5',
              )}
            >
              <span
                className={cn(
                  'flex size-11 items-center justify-center rounded-xl',
                  isSelected ? 'bg-primary/15' : 'bg-secondary',
                )}
              >
                <category.icon className={cn('size-5', isSelected ? 'text-primary' : 'text-muted-foreground')} />
              </span>
              <span className="text-sm font-medium">{category.name}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
