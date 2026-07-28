import { apiClient } from './axios';

export interface ApiServiceCategory {
  id: string;
  name: string;
  slug: string;
  icon: string | null;
  parentId: string | null;
}

/// Endpoint público — não exige sessão (landing page, wizards antes de
/// login). Ver apps/api/src/modules/categories.
export async function fetchCategories(): Promise<ApiServiceCategory[]> {
  const { data } = await apiClient.get<ApiServiceCategory[]>('/categories');
  return data;
}
