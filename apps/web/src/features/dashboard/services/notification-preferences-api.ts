import { apiClient } from '@/services/api';

export interface NotificationPreferences {
  id: string;
  emailEnabled: boolean;
  pushEnabled: boolean;
  smsEnabled: boolean;
}

export async function fetchMyNotificationPreferences(): Promise<NotificationPreferences> {
  const { data } = await apiClient.get<NotificationPreferences>('/notification-preferences/me');
  return data;
}

export async function updateMyNotificationPreferences(
  params: Partial<Pick<NotificationPreferences, 'emailEnabled'>>,
): Promise<NotificationPreferences> {
  const { data } = await apiClient.patch<NotificationPreferences>('/notification-preferences/me', params);
  return data;
}
