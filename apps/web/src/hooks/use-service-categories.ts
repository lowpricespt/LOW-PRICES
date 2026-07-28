'use client';

import { useQuery } from '@tanstack/react-query';
import { Wrench, type LucideIcon } from 'lucide-react';
import { fetchCategories } from '@/services/api';
import { SERVICE_CATEGORIES } from '@/constants/categories';

export interface ServiceCategoryOption {
  /// UUID real da ServiceCategory — é este valor (nunca o slug) que vai
  /// para o backend em categoryId/categoryIds.
  id: string;
  slug: string;
  name: string;
  icon: LucideIcon;
}

/**
 * Fonte única da verdade para categorias em toda a app: vai buscar a
 * lista real (com IDs reais) à API e usa apps/web/src/constants/categories.ts
 * só para o ícone — nunca para o ID. Antes desta correção, os wizards
 * enviavam o slug local como se fosse o ID, o que o backend sempre
 * rejeitava (categoryId tem de ser um UUID) e impedia qualquer pedido de
 * ser criado.
 */
export function useServiceCategories() {
  const query = useQuery({
    queryKey: ['categories'],
    queryFn: fetchCategories,
    staleTime: 10 * 60 * 1000,
  });

  const categories: ServiceCategoryOption[] = (query.data ?? [])
    .filter((category) => !category.parentId) // só categorias de topo, por agora
    .map((category) => {
      const local = SERVICE_CATEGORIES.find((entry) => entry.id === category.slug);
      return {
        id: category.id,
        slug: category.slug,
        name: category.name,
        icon: local?.icon ?? Wrench,
      };
    });

  return {
    categories,
    isLoading: query.isLoading,
    isError: query.isError,
  };
}
