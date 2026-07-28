import { apiClient } from '@/services/api';

export interface EarningsSummary {
  totalEarned: number;
  completedJobsCount: number;
  currentMonthEarned: number;
  currentMonthJobsCount: number;
  note: string;
}

export async function fetchEarnings(): Promise<EarningsSummary> {
  const { data } = await apiClient.get<EarningsSummary>('/jobs/me/earnings');
  return data;
}
