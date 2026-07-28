import { apiClient } from '@/services/api';

export async function updateProfessionalCategories(categoryIds: string[]): Promise<{ categoryIds: string[] }> {
  const { data } = await apiClient.patch<{ categoryIds: string[] }>('/users/me/professional/categories', {
    categoryIds,
  });
  return data;
}
