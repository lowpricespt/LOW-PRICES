import { apiClient } from '@/services/api';

export interface Review {
  id: string;
  jobId: string;
  rating: number;
  comment: string | null;
  createdAt: string;
  clientName?: string;
}

export interface ReviewsSummary {
  average: number | null;
  count: number;
  items: Review[];
}

export async function fetchMyReviews(): Promise<ReviewsSummary> {
  const { data } = await apiClient.get<ReviewsSummary>('/reviews/me');
  return data;
}

export async function submitReview(params: { jobId: string; rating: number; comment?: string }): Promise<Review> {
  const { data } = await apiClient.post<Review>('/reviews', params);
  return data;
}
