'use client';

import * as React from 'react';
import { Search } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from './button';

export interface SearchBarProps extends React.FormHTMLAttributes<HTMLFormElement> {
  placeholder?: string;
  buttonLabel?: string;
  onSearch?: (value: string) => void;
}

function SearchBar({
  placeholder = 'De que serviço precisas?',
  buttonLabel = 'Procurar',
  onSearch,
  className,
  ...props
}: SearchBarProps) {
  const [value, setValue] = React.useState('');

  return (
    <form
      className={cn(
        'flex w-full flex-col gap-2 rounded-2xl border border-border bg-card p-2 shadow-sm sm:flex-row',
        className,
      )}
      onSubmit={(event) => {
        event.preventDefault();
        onSearch?.(value);
      }}
      {...props}
    >
      <div className="flex flex-1 items-center gap-2 px-3 py-2.5">
        <Search className="size-4 shrink-0 text-muted-foreground" />
        <input
          type="text"
          value={value}
          onChange={(event) => setValue(event.target.value)}
          placeholder={placeholder}
          className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
        />
      </div>
      <Button type="submit" size="lg" className="w-full sm:w-auto">
        {buttonLabel}
      </Button>
    </form>
  );
}

export { SearchBar };
