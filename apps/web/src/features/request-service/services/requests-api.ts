import { apiClient } from '@/services/api';

export interface ServiceRequestCategory {
  id: string;
  name: string;
  slug: string;
}

export interface ServiceRequestQuoteSummary {
  id: string;
  status: string;
  price: number;
}

export interface ServiceRequest {
  id: string;
  status: string;
  category: ServiceRequestCategory;
  description: string;
  photoUrls: string[];
  location: string;
  latitude: number | null;
  longitude: number | null;
  urgency: string;
  budget: number | null;
  publishedAt: string | null;
  createdAt: string;
  isLocationUnlocked: boolean;
  quotesCount?: number;
  /// Só vem preenchido em GET /requests/available (o próprio profissional
  /// a pedir) — null = ainda não enviou orçamento, undefined = não aplicável.
  myQuote?: ServiceRequestQuoteSummary | null;
}

export interface PaginatedServiceRequests {
  items: ServiceRequest[];
  page: number;
  pageSize: number;
  total: number;
  isLocationUnlocked?: boolean;
}

export interface ServiceRequestResponse {
  id: string;
  status: string;
}

export async function createServiceRequest(params: {
  categoryId: string;
  description: string;
  photoUrls?: string[];
  location: string;
  latitude?: number;
  longitude?: number;
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

export async function fetchMyServiceRequests(params?: {
  page?: number;
  pageSize?: number;
}): Promise<PaginatedServiceRequests> {
  const { data } = await apiClient.get<PaginatedServiceRequests>('/requests/me', { params });
  return data;
}

export async function fetchAvailableServiceRequests(params?: {
  page?: number;
  pageSize?: number;
}): Promise<PaginatedServiceRequests> {
  const { data } = await apiClient.get<PaginatedServiceRequests>('/requests/available', { params });
  return data;
}
