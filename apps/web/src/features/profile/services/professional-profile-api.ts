import { apiClient } from '@/services/api';

export interface ProfessionalProfileDetails {
  bio: string | null;
  serviceRadiusKm: number;
  verificationStatus: 'PENDING' | 'APPROVED' | 'REJECTED';
  avatarUrl: string | null;
  categories: { id: string; name: string; slug: string }[];
}

export async function fetchProfessionalProfile(): Promise<ProfessionalProfileDetails> {
  const { data } = await apiClient.get<ProfessionalProfileDetails>('/users/me/professional/profile');
  return data;
}

export async function updateProfessionalProfileRequest(params: {
  bio?: string;
  serviceRadiusKm?: number;
}): Promise<ProfessionalProfileDetails> {
  const { data } = await apiClient.patch<ProfessionalProfileDetails>('/users/me/professional/profile', params);
  return data;
}
