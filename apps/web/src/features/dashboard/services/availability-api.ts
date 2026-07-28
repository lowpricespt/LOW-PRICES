import { apiClient } from '@/services/api';

export interface AvailabilityBlock {
  id: string;
  professionalProfileId: string;
  startDate: string;
  endDate: string;
  reason: string | null;
  createdAt: string;
}

export async function fetchAvailabilityBlocks(): Promise<AvailabilityBlock[]> {
  const { data } = await apiClient.get<AvailabilityBlock[]>('/professionals/me/availability-blocks');
  return data;
}

export async function createAvailabilityBlock(params: {
  startDate: string;
  endDate: string;
  reason?: string;
}): Promise<AvailabilityBlock> {
  const { data } = await apiClient.post<AvailabilityBlock>('/professionals/me/availability-blocks', params);
  return data;
}

export async function deleteAvailabilityBlock(id: string): Promise<void> {
  await apiClient.delete(`/professionals/me/availability-blocks/${id}`);
}
