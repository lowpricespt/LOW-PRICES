import { apiClient } from '@/services/api';

export const WEEKDAY_OPTIONS = [
  { id: 'seg', label: 'Seg' },
  { id: 'ter', label: 'Ter' },
  { id: 'qua', label: 'Qua' },
  { id: 'qui', label: 'Qui' },
  { id: 'sex', label: 'Sex' },
  { id: 'sab', label: 'Sáb' },
  { id: 'dom', label: 'Dom' },
] as const;

export interface ProfessionalProfileDetails {
  bio: string | null;
  serviceRadiusKm: number;
  location: string | null;
  latitude: number | null;
  longitude: number | null;
  availableDays: string[];
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
  location?: string;
  latitude?: number;
  longitude?: number;
  availableDays?: string[];
}): Promise<ProfessionalProfileDetails> {
  const { data } = await apiClient.patch<ProfessionalProfileDetails>('/users/me/professional/profile', params);
  return data;
}
