import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../infra/prisma/prisma.service';

@Injectable()
export class MessagesRepository {
  constructor(private readonly prisma: PrismaService) {}

  findByQuote(quoteId: string) {
    return this.prisma.message.findMany({
      where: { quoteId },
      include: { sender: true },
      orderBy: { createdAt: 'asc' },
    });
  }

  create(quoteId: string, senderUserId: string, body: string) {
    return this.prisma.message.create({
      data: { quoteId, senderUserId, body },
      include: { sender: true },
    });
  }

  /// Marca como lidas todas as mensagens do orçamento que NÃO foram
  /// enviadas por quem está a ler agora — usado quando se abre a conversa.
  markReadForViewer(quoteId: string, viewerUserId: string) {
    return this.prisma.message.updateMany({
      where: { quoteId, senderUserId: { not: viewerUserId }, readAt: null },
      data: { readAt: new Date() },
    });
  }

  countUnreadForViewer(quoteId: string, viewerUserId: string) {
    return this.prisma.message.count({
      where: { quoteId, senderUserId: { not: viewerUserId }, readAt: null },
    });
  }
}
