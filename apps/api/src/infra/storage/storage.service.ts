import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import type { StorageProvider } from './interfaces/storage-provider.interface';
import { STORAGE_PROVIDER } from './storage.constants';
import { ImageProcessingService } from './image-processing.service';

export type UploadFolder =
  | 'avatars'
  | 'covers'
  | 'documents'
  | 'certificates'
  | 'request-photos'
  | 'chat-attachments'
  | 'portfolio';

const PRIVATE_FOLDERS: UploadFolder[] = ['documents', 'certificates'];
const IMAGE_FOLDERS: UploadFolder[] = ['avatars', 'covers', 'request-photos', 'portfolio', 'chat-attachments'];

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10MB
const ALLOWED_CONTENT_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];

export interface UploadResult {
  key: string;
  url: string;
  thumbnailUrl?: string;
  isPublic: boolean;
}

@Injectable()
export class StorageService {
  constructor(
    @Inject(STORAGE_PROVIDER) private readonly provider: StorageProvider,
    private readonly imageProcessing: ImageProcessingService,
  ) {}

  async uploadFile(params: {
    buffer: Buffer;
    originalFileName: string;
    contentType: string;
    folder: UploadFolder;
    ownerId: string;
  }): Promise<UploadResult> {
    this.validate(params.buffer, params.contentType);

    const isPublic = !PRIVATE_FOLDERS.includes(params.folder);
    const isImage = IMAGE_FOLDERS.includes(params.folder) && params.contentType.startsWith('image/');
    const extension = isImage ? 'webp' : this.extensionFromFileName(params.originalFileName);
    const baseKey = `${params.folder}/${params.ownerId}/${randomUUID()}`;

    if (isImage) {
      const processed = await this.imageProcessing.process(params.buffer);
      const key = `${baseKey}.${extension}`;
      const thumbnailKey = `${baseKey}-thumb.${extension}`;

      await Promise.all([
        this.provider.upload({ buffer: processed.original, key, contentType: processed.contentType }),
        this.provider.upload({ buffer: processed.thumbnail, key: thumbnailKey, contentType: processed.contentType }),
      ]);

      return {
        key,
        url: isPublic ? this.provider.getPublicUrl(key) : await this.provider.getSignedUrl(key, 3600),
        thumbnailUrl: isPublic
          ? this.provider.getPublicUrl(thumbnailKey)
          : await this.provider.getSignedUrl(thumbnailKey, 3600),
        isPublic,
      };
    }

    const key = `${baseKey}.${extension}`;
    await this.provider.upload({ buffer: params.buffer, key, contentType: params.contentType });

    return {
      key,
      url: isPublic ? this.provider.getPublicUrl(key) : await this.provider.getSignedUrl(key, 3600),
      isPublic,
    };
  }

  async deleteFile(key: string): Promise<void> {
    await this.provider.delete(key);
    // Se for uma imagem processada, também existe uma thumbnail associada
    // (mesma base, sufixo "-thumb") — apagar as duas evita ficheiros órfãos.
    const thumbnailKey = this.toThumbnailKey(key);
    if (thumbnailKey) {
      await this.provider.delete(thumbnailKey).catch(() => undefined); // pode não existir (ficheiro não-imagem)
    }
  }

  async getFreshSignedUrl(key: string, expiresInSeconds = 3600): Promise<string> {
    return this.provider.getSignedUrl(key, expiresInSeconds);
  }

  private validate(buffer: Buffer, contentType: string): void {
    if (!ALLOWED_CONTENT_TYPES.includes(contentType)) {
      throw new BadRequestException(
        `Tipo de ficheiro não suportado: ${contentType}. Permitidos: ${ALLOWED_CONTENT_TYPES.join(', ')}.`,
      );
    }
    if (buffer.byteLength > MAX_FILE_SIZE_BYTES) {
      throw new BadRequestException(`Ficheiro demasiado grande (máximo ${MAX_FILE_SIZE_BYTES / 1024 / 1024}MB).`);
    }
  }

  private extensionFromFileName(fileName: string): string {
    const match = /\.([a-zA-Z0-9]+)$/.exec(fileName);
    return match ? match[1].toLowerCase() : 'bin';
  }

  private toThumbnailKey(key: string): string | null {
    const match = /^(.+)(\.[a-zA-Z0-9]+)$/.exec(key);
    if (!match) return null;
    return `${match[1]}-thumb${match[2]}`;
  }
}
