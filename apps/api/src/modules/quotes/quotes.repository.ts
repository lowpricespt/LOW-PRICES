import { Injectable } from '@nestjs/common';
import type { Prisma } from '@prisma/client';
import { PrismaService } from '../../infra/prisma/prisma.service';

const WITH_PROFESSIONAL = {
  professionalProfile: { include: { user: true } },
} satisfies Prisma.QuoteInclude;

@Injectable()
export class QuotesRepository {
  constructor(private readonly prisma: PrismaService) {}

  create(data: Prisma.QuoteUncheckedCreateInput) {
    return this.prisma.quote.create({ data, include: WITH_PROFESSIONAL });
  }

  findById(id: string) {
    return this.prisma.quote.findUnique({ where: { id }, include: WITH_PROFESSIONAL });
  }

  findByServiceRequest(serviceRequestId: string) {
    return this.prisma.quote.findMany({
      where: { serviceRequestId },
      include: WITH_PROFESSIONAL,
      orderBy: { createdAt: 'desc' },
    });
  }

  findExisting(serviceRequestId: string, professionalProfileId: string) {
    return this.prisma.quote.findFirst({ where: { serviceRequestId, professionalProfileId } });
  }

  update(id: string, data: Prisma.QuoteUpdateInput) {
    return this.prisma.quote.update({ where: { id }, data, include: WITH_PROFESSIONAL });
  }

  rejectOthers(serviceRequestId: string, acceptedQuoteId: string) {
    return this.prisma.quote.updateMany({
      where: { serviceRequestId, id: { not: acceptedQuoteId }, status: 'SENT' },
      data: { status: 'REJECTED', respondedAt: new Date() },
    });
  }

  createJob(data: Prisma.JobUncheckedCreateInput) {
    return this.prisma.job.create({ data });
  }
}
