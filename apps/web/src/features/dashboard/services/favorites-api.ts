import { apiClient } from '@/services/api';

export interface FavoriteProfessional {
  professionalProfileId: string;
  name: string;
  avatarUrl: string | null;
  bio: string | null;
  categories: string[];
  favoritedAt: string;
}

export async function fetchMyFavorites(): Promise<FavoriteProfessional[]> {
  const { data } = await apiClient.get<FavoriteProfessional[]>('/favorites');
  return data;
}

export async function addFavorite(professionalProfileId: string): Promise<void> {
  await apiClient.post('/favorites', { professionalProfileId });
}

export async function removeFavorite(professionalProfileId: string): Promise<void> {
  await apiClient.delete(`/favorites/${professionalProfileId}`);
}
