import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../infra/prisma/prisma.service';

@Injectable()
export class MessagesRepository {
  constructor(private readonly prisma: PrismaService) {}

  findByJob(jobId: string) {
    return this.prisma.message.findMany({
      where: { jobId },
      include: { sender: true },
      orderBy: { createdAt: 'asc' },
    });
  }

  create(jobId: string, senderUserId: string, body: string) {
    return this.prisma.message.create({
      data: { jobId, senderUserId, body },
      include: { sender: true },
    });
  }

  /// Marca como lidas todas as mensagens do Job que NÃO foram enviadas
  /// por quem está a ler agora — usado quando se abre a conversa.
  markReadForViewer(jobId: string, viewerUserId: string) {
    return this.prisma.message.updateMany({
      where: { jobId, senderUserId: { not: viewerUserId }, readAt: null },
      data: { readAt: new Date() },
    });
  }

  countUnreadForViewer(jobId: string, viewerUserId: string) {
    return this.prisma.message.count({
      where: { jobId, senderUserId: { not: viewerUserId }, readAt: null },
    });
  }
}
