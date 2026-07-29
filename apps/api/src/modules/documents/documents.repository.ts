import { Injectable } from '@nestjs/common';
import type { DocumentType } from '@prisma/client';
import { PrismaService } from '../../infra/prisma/prisma.service';

@Injectable()
export class DocumentsRepository {
  constructor(private readonly prisma: PrismaService) {}

  findManyByProfessional(professionalProfileId: string) {
    return this.prisma.document.findMany({
      where: { professionalProfileId },
      orderBy: { uploadedAt: 'desc' },
    });
  }

  findByProfessionalAndType(professionalProfileId: string, type: DocumentType) {
    return this.prisma.document.findFirst({ where: { professionalProfileId, type } });
  }

  create(professionalProfileId: string, type: DocumentType, key: string) {
    return this.prisma.document.create({
      data: { professionalProfileId, type, fileUrl: key },
    });
  }

  /**
   * Reenviar um documento substitui o anterior (mesmo tipo) em vez de
   * criar um duplicado — e volta sempre a PENDING: uma aprovação/rejeição
   * anterior não se aplica a um ficheiro novo.
   */
  replace(id: string, key: string) {
    return this.prisma.document.update({
      where: { id },
      data: { fileUrl: key, status: 'PENDING', uploadedAt: new Date(), reviewedAt: null },
    });
  }
}
