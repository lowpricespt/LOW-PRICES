import { apiClient } from '@/services/api';
import type { AuthUser } from '@/features/auth/services/auth-api';

export async function updateProfileRequest(params: {
  name?: string;
  phone?: string;
  avatarUrl?: string;
}): Promise<AuthUser> {
  const { data } = await apiClient.patch<AuthUser>('/users/me', params);
  return data;
}
