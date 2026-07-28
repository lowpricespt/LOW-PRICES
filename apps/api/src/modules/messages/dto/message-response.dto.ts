import type { Message, User } from '@prisma/client';

type MessageWithSender = Message & { sender: User };

export class MessageResponseDto {
  id!: string;
  jobId!: string;
  body!: string;
  createdAt!: Date;
  isMine!: boolean;
  senderName!: string;

  static fromEntity(entity: MessageWithSender, currentUserId: string): MessageResponseDto {
    return {
      id: entity.id,
      jobId: entity.jobId,
      body: entity.body,
      createdAt: entity.createdAt,
      isMine: entity.senderUserId === currentUserId,
      senderName: entity.sender.name,
    };
  }
}
