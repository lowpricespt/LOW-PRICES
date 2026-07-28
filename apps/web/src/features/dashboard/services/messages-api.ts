import { apiClient } from '@/services/api';

export interface Conversation {
  jobId: string;
  serviceRequestTitle: string;
  otherPartyName: string;
  status: string;
  unreadCount: number;
}

export interface Message {
  id: string;
  jobId: string;
  body: string;
  createdAt: string;
  isMine: boolean;
  senderName: string;
}

export async function fetchMyConversations(): Promise<Conversation[]> {
  const { data } = await apiClient.get<Conversation[]>('/conversations/me');
  return data;
}

export async function fetchMessages(jobId: string): Promise<Message[]> {
  const { data } = await apiClient.get<Message[]>(`/jobs/${jobId}/messages`);
  return data;
}

export async function sendMessage(jobId: string, body: string): Promise<Message> {
  const { data } = await apiClient.post<Message>(`/jobs/${jobId}/messages`, { body });
  return data;
}
