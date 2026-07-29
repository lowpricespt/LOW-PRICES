import { apiClient } from '@/services/api';

export interface Conversation {
  quoteId: string;
  serviceRequestTitle: string;
  otherPartyName: string;
  status: string;
  unreadCount: number;
}

export interface Message {
  id: string;
  quoteId: string;
  body: string;
  createdAt: string;
  isMine: boolean;
  senderName: string;
}

export async function fetchMyConversations(): Promise<Conversation[]> {
  const { data } = await apiClient.get<Conversation[]>('/conversations/me');
  return data;
}

export async function fetchMessages(quoteId: string): Promise<Message[]> {
  const { data } = await apiClient.get<Message[]>(`/quotes/${quoteId}/messages`);
  return data;
}

export async function sendMessage(quoteId: string, body: string): Promise<Message> {
  const { data } = await apiClient.post<Message>(`/quotes/${quoteId}/messages`, { body });
  return data;
}
