import type { Message, User } from '@prisma/client';

type MessageWithSender = Message & { sender: User };

export class MessageResponseDto {
  id!: string;
  quoteId!: string;
  body!: string;
  createdAt!: Date;
  isMine!: boolean;
  senderName!: string;

  static fromEntity(entity: MessageWithSender, currentUserId: string): MessageResponseDto {
    return {
      id: entity.id,
      quoteId: entity.quoteId,
      body: entity.body,
      createdAt: entity.createdAt,
      isMine: entity.senderUserId === currentUserId,
      senderName: entity.sender.name,
    };
  }
}
