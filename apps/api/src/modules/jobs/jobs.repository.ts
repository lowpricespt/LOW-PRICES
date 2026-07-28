import { Injectable } from '@nestjs/common';
import type { Prisma } from '@prisma/client';
import { PrismaService } from '../../infra/prisma/prisma.service';

const WITH_PARTIES = {
  serviceRequest: { include: { client: { include: { user: true } } } },
  quote: { include: { professionalProfile: { include: { user: true } } } },
} satisfies Prisma.JobInclude;

@Injectable()
export class JobsRepository {
  constructor(private readonly prisma: PrismaService) {}

  findById(id: string) {
    return this.prisma.job.findUnique({ where: { id }, include: WITH_PARTIES });
  }

  findManyForClient(clientProfileId: string) {
    return this.prisma.job.findMany({
      where: { serviceRequest: { clientId: clientProfileId } },
      include: WITH_PARTIES,
      orderBy: { scheduledStart: 'desc' },
    });
  }

  findManyForProfessional(professionalProfileId: string) {
    return this.prisma.job.findMany({
      where: { quote: { professionalProfileId } },
      include: WITH_PARTIES,
      orderBy: { scheduledStart: 'desc' },
    });
  }
}
