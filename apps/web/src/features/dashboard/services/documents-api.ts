import { apiClient } from '@/services/api';

export type ProfessionalDocumentType = 'IDENTITY' | 'PROOF_OF_ACTIVITY' | 'CERTIFICATE';

export interface ProfessionalDocument {
  id: string;
  type: ProfessionalDocumentType;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  uploadedAt: string;
  url: string | null;
}

export async function fetchMyDocuments(): Promise<ProfessionalDocument[]> {
  const { data } = await apiClient.get<ProfessionalDocument[]>('/documents/me');
  return data;
}

/** `key` é a key devolvida por uploadFile() (services/api/upload-api.ts), nunca a URL. */
export async function upsertDocument(type: ProfessionalDocumentType, key: string): Promise<ProfessionalDocument> {
  const { data } = await apiClient.post<ProfessionalDocument>('/documents', { type, key });
  return data;
}
