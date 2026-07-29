import { Injectable } from '@nestjs/common';
import type { Document } from '@prisma/client';
import { StorageService } from '../../infra/storage/storage.service';
import { DocumentsRepository } from './documents.repository';
import type { UpsertDocumentDto } from './dto/upsert-document.dto';

export interface DocumentResponse {
  id: string;
  type: string;
  status: string;
  uploadedAt: Date;
  url: string | null;
}

@Injectable()
export class DocumentsService {
  constructor(
    private readonly documentsRepository: DocumentsRepository,
    private readonly storageService: StorageService,
  ) {}

  async findMine(professionalProfileId: string): Promise<DocumentResponse[]> {
    const documents = await this.documentsRepository.findManyByProfessional(professionalProfileId);
    return Promise.all(documents.map((document) => this.toResponse(document)));
  }

  async upsert(professionalProfileId: string, dto: UpsertDocumentDto): Promise<DocumentResponse> {
    const existing = await this.documentsRepository.findByProfessionalAndType(professionalProfileId, dto.type);
    const document = existing
      ? await this.documentsRepository.replace(existing.id, dto.key)
      : await this.documentsRepository.create(professionalProfileId, dto.type, dto.key);
    return this.toResponse(document);
  }

  /**
   * `Document.fileUrl` guarda a KEY do storage (pasta privada
   * "documents"), nunca a URL final — uma URL assinada expira (1h), por
   * isso gera-se sempre uma fresca no momento da leitura em vez de a
   * guardar congelada na BD.
   */
  private async toResponse(document: Document): Promise<DocumentResponse> {
    return {
      id: document.id,
      type: document.type,
      status: document.status,
      uploadedAt: document.uploadedAt,
      url: document.fileUrl ? await this.storageService.getFreshSignedUrl(document.fileUrl) : null,
    };
  }
}
