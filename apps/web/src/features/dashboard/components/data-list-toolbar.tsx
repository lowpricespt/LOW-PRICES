'use client';

import { Search, ArrowUpDown } from 'lucide-react';
import {
  Input,
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  Button,
} from '@/components/ui';

export interface DataListToolbarProps {
  searchValue: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder?: string;
  filterLabel: string;
  filterOptions: { value: string; label: string }[];
  activeFilter: string;
  onFilterChange: (value: string) => void;
  sortOptions: { value: string; label: string }[];
  activeSort: string;
  onSortChange: (value: string) => void;
}

export function DataListToolbar({
  searchValue,
  onSearchChange,
  searchPlaceholder = 'Pesquisar...',
  filterLabel,
  filterOptions,
  activeFilter,
  onFilterChange,
  sortOptions,
  activeSort,
  onSortChange,
}: DataListToolbarProps) {
  return (
    <div className="mb-4 flex flex-col gap-3 sm:flex-row">
      <div className="relative flex-1">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={searchValue}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder={searchPlaceholder}
          className="pl-9"
        />
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="justify-between sm:w-44">
            {filterOptions.find((option) => option.value === activeFilter)?.label ?? filterLabel}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>{filterLabel}</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {filterOptions.map((option) => (
            <DropdownMenuItem key={option.value} onClick={() => onFilterChange(option.value)}>
              {option.label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="justify-between sm:w-44">
            <ArrowUpDown className="size-4" />
            {sortOptions.find((option) => option.value === activeSort)?.label}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Ordenar por</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {sortOptions.map((option) => (
            <DropdownMenuItem key={option.value} onClick={() => onSortChange(option.value)}>
              {option.label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
