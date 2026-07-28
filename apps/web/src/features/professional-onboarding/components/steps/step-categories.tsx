'use client';

import { useState } from 'react';
import { SERVICE_CATEGORIES } from '@/constants/categories';
import { cn } from '@/lib/utils';

export function StepCategories() {
  const [selected, setSelected] = useState<string[]>([]);

  function toggle(id: string) {
    setSelected((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]));
  }

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold tracking-tight sm:text-3xl">
        Em que categorias trabalhas?
      </h1>
      <p className="mt-2 text-muted-foreground">Podes escolher mais do que uma.</p>

      <div className="mt-6 flex flex-wrap gap-2">
        {SERVICE_CATEGORIES.map((category) => {
          const isSelected = selected.includes(category.id);
          return (
            <button
              key={category.id}
              type="button"
              onClick={() => toggle(category.id)}
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
