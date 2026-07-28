import { Injectable } from '@nestjs/common';
import type { Prisma } from '@prisma/client';
import { PrismaService } from '../../infra/prisma/prisma.service';

const WITH_CLIENT = { client: { include: { user: true } } } satisfies Prisma.ReviewInclude;

@Injectable()
export class ReviewsRepository {
  constructor(private readonly prisma: PrismaService) {}

  create(data: Prisma.ReviewUncheckedCreateInput) {
    return this.prisma.review.create({ data });
  }

  findExistingByJob(jobId: string) {
    return this.prisma.review.findUnique({ where: { jobId } });
  }

  findByProfessional(professionalProfileId: string) {
    return this.prisma.review.findMany({
      where: { professionalProfileId },
      include: WITH_CLIENT,
      orderBy: { createdAt: 'desc' },
    });
  }

  async getSummaryForProfessional(professionalProfileId: string) {
    const result = await this.prisma.review.aggregate({
      where: { professionalProfileId },
      _avg: { rating: true },
      _count: true,
    });
    return { average: result._avg.rating, count: result._count };
  }
}
