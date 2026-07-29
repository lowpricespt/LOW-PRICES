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
  hasReview: boolean;
  otherParty: JobContact;
}

export async function fetchMyJobs(): Promise<Job[]> {
  const { data } = await apiClient.get<Job[]>('/jobs/me');
  return data;
}

export async function startJob(jobId: string): Promise<Job> {
  const { data } = await apiClient.patch<Job>(`/jobs/${jobId}/start`);
  return data;
}

export async function completeJob(jobId: string): Promise<Job> {
  const { data } = await apiClient.patch<Job>(`/jobs/${jobId}/complete`);
  return data;
}

export async function cancelJob(jobId: string, reason?: string): Promise<Job> {
  const { data } = await apiClient.patch<Job>(`/jobs/${jobId}/cancel`, { reason });
  return data;
}

export async function scheduleJob(jobId: string, scheduledStart: string, scheduledEnd: string): Promise<Job> {
  const { data } = await apiClient.patch<Job>(`/jobs/${jobId}/schedule`, { scheduledStart, scheduledEnd });
  return data;
}
