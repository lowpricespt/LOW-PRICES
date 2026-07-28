import { apiClient, setAccessToken } from '@/services/api';

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  phone: string | null;
  role: 'CLIENT' | 'PROFESSIONAL' | 'ADMIN';
  status: string;
  avatarUrl: string | null;
  createdAt: string;
}

interface AuthResponse {
  accessToken: string;
  user: AuthUser;
}

export async function registerRequest(params: {
  name: string;
  email: string;
  password: string;
  role: 'CLIENT' | 'PROFESSIONAL';
}): Promise<AuthUser> {
  const { data } = await apiClient.post<AuthResponse>('/auth/register', params);
  setAccessToken(data.accessToken);
  return data.user;
}

export async function loginRequest(params: { email: string; password: string }): Promise<AuthUser> {
  const { data } = await apiClient.post<AuthResponse>('/auth/login', params);
  setAccessToken(data.accessToken);
  return data.user;
}

export async function logoutRequest(): Promise<void> {
  await apiClient.post('/auth/logout');
  setAccessToken(null);
}

export async function fetchCurrentUser(): Promise<AuthUser> {
  const { data } = await apiClient.get<AuthUser>('/users/me');
  return data;
}

export async function forgotPasswordRequest(email: string): Promise<void> {
  await apiClient.post('/auth/forgot-password', { email });
}

export async function resetPasswordRequest(token: string, newPassword: string): Promise<void> {
  await apiClient.post('/auth/reset-password', { token, newPassword });
}
