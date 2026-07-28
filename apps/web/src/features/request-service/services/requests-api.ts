import { apiClient } from '@/services/api';

export interface ServiceRequestResponse {
  id: string;
  status: string;
}

export async function createServiceRequest(params: {
  categoryId: string;
  description: string;
  location: string;
  urgency: string;
  budget?: number;
}): Promise<ServiceRequestResponse> {
  const { data } = await apiClient.post<ServiceRequestResponse>('/requests', params);
  return data;
}

export async function publishServiceRequest(id: string): Promise<ServiceRequestResponse> {
  const { data } = await apiClient.post<ServiceRequestResponse>(`/requests/${id}/publish`);
  return data;
}
