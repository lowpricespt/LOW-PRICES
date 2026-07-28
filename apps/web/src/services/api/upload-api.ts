import { apiClient } from '@/services/api';

export interface UploadResult {
  key: string;
  url: string;
  thumbnailUrl?: string;
  isPublic: boolean;
}

export type UploadFolder = 'avatars' | 'covers' | 'documents' | 'certificates' | 'request-photos' | 'portfolio';

export async function uploadFile(
  file: File,
  folder: UploadFolder,
  onProgress?: (percent: number) => void,
): Promise<UploadResult> {
  const formData = new FormData();
  formData.append('file', file);

  const { data } = await apiClient.post<UploadResult>(`/storage/upload?folder=${folder}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    onUploadProgress: (event) => {
      if (event.total && onProgress) {
        onProgress(Math.round((event.loaded / event.total) * 100));
      }
    },
  });
  return data;
}
