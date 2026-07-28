import { apiClient } from '@/services/api';

export interface AreaAccessStatus {
  isActive: boolean;
  subscriptionTier: string | null;
  areaAccessExpiresAt: string | null;
}

export async function fetchMyAreaAccess(): Promise<AreaAccessStatus> {
  const { data } = await apiClient.get<AreaAccessStatus>('/pricing/area-access/me');
  return data;
}

export async function activateAreaAccessSimulated(plan: 'monthly' | 'weekly'): Promise<{ hasAreaAccess: boolean; areaAccessExpiresAt: string }> {
  const { data } = await apiClient.post('/pricing/area-access/activate-simulated', { plan });
  return data;
}
