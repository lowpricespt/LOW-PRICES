import type { Review } from '@prisma/client';

type ReviewWithClient = Review & { client: { user: { name: string } } };

export class ReviewResponseDto {
  id!: string;
  jobId!: string;
  rating!: number;
  comment!: string | null;
  createdAt!: Date;
  clientName?: string;

  static fromEntity(entity: Review): ReviewResponseDto {
    return {
      id: entity.id,
      jobId: entity.jobId,
      rating: entity.rating,
      comment: entity.comment,
      createdAt: entity.createdAt,
    };
  }

  static fromEntityWithClient(entity: ReviewWithClient): ReviewResponseDto {
    return { ...ReviewResponseDto.fromEntity(entity), clientName: entity.client.user.name };
  }
}
