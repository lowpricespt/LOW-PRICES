import { apiClient } from '@/services/api';

export interface Quote {
  id: string;
  serviceRequestId: string;
  status: string;
  price: number;
  message: string | null;
  createdAt: string;
  respondedAt: string | null;
  professional: {
    professionalProfileId: string;
    name: string;
    avatarUrl: string | null;
  };
}

export async function fetchQuotesForRequest(serviceRequestId: string): Promise<Quote[]> {
  const { data } = await apiClient.get<Quote[]>(`/requests/${serviceRequestId}/quotes`);
  return data;
}

export async function createQuote(params: {
  serviceRequestId: string;
  price: number;
  message?: string;
}): Promise<Quote> {
  const { data } = await apiClient.post<Quote>('/quotes', params);
  return data;
}

export async function acceptQuote(quoteId: string): Promise<Quote> {
  const { data } = await apiClient.post<Quote>(`/quotes/${quoteId}/accept`);
  return data;
}

export async function rejectQuote(quoteId: string): Promise<Quote> {
  const { data } = await apiClient.post<Quote>(`/quotes/${quoteId}/reject`);
  return data;
}
