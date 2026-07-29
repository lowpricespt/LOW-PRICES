import { apiClient } from '@/services/api';

export interface AdminProfessionalDocument {
  id: string;
  type: string;
  fileUrl: string | null;
  status: string;
  uploadedAt: string;
}

export interface AdminProfessional {
  id: string;
  bio: string | null;
  serviceRadiusKm: number;
  verificationStatus: 'PENDING' | 'APPROVED' | 'REJECTED';
  createdAt: string;
  user: { id: string; name: string; email: string; phone: string | null; createdAt: string };
  categories: { id: string; name: string; slug: string }[];
  documents: AdminProfessionalDocument[];
  city: string | null;
}

export async function fetchProfessionalsForReview(
  status: 'PENDING' | 'APPROVED' | 'REJECTED' = 'PENDING',
): Promise<AdminProfessional[]> {
  const { data } = await apiClient.get<AdminProfessional[]>('/admin/professionals', { params: { status } });
  return data;
}

export async function updateProfessionalVerification(
  id: string,
  status: 'APPROVED' | 'REJECTED',
  reason?: string,
): Promise<{ id: string; verificationStatus: string }> {
  const { data } = await apiClient.patch(`/admin/professionals/${id}/verification`, { status, reason });
  return data;
}
