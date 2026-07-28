import { apiClient } from '@/services/api';

export interface JobContact {
  name: string;
  email: string;
  phone: string | null;
}

export interface Job {
  id: string;
  status: string;
  serviceRequestId: string;
  quoteId: string;
  serviceRequestTitle: string;
  price: number;
  scheduledStart: string | null;
  scheduledEnd: string | null;
  completedAt: string | null;
  otherParty: JobContact;
}

export async function fetchMyJobs(): Promise<Job[]> {
  const { data } = await apiClient.get<Job[]>('/jobs/me');
  return data;
}
