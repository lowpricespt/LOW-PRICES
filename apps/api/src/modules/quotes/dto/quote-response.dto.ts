import type { Quote, ProfessionalProfile, User } from '@prisma/client';

type QuoteWithProfessional = Quote & {
  professionalProfile: ProfessionalProfile & { user: User };
};

export class QuoteResponseDto {
  id!: string;
  serviceRequestId!: string;
  status!: string;
  price!: number;
  message!: string | null;
  createdAt!: Date;
  respondedAt!: Date | null;
  professional!: {
    professionalProfileId: string;
    name: string;
    avatarUrl: string | null;
  };

  static fromEntity(entity: QuoteWithProfessional): QuoteResponseDto {
    return {
      id: entity.id,
      serviceRequestId: entity.serviceRequestId,
      status: entity.status,
      price: Number(entity.price),
      message: entity.message,
      createdAt: entity.createdAt,
      respondedAt: entity.respondedAt,
      professional: {
        professionalProfileId: entity.professionalProfileId,
        name: entity.professionalProfile.user.name,
        avatarUrl: entity.professionalProfile.avatarUrl,
      },
    };
  }
}
