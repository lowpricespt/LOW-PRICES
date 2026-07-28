import { Injectable } from '@nestjs/common';
import type { Prisma } from '@prisma/client';
import { PrismaService } from '../../infra/prisma/prisma.service';

const WITH_PARTIES = {
  serviceRequest: { include: { client: { include: { user: true } } } },
  quote: { include: { professionalProfile: { include: { user: true } } } },
  review: true,
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

  updateStatus(id: string, data: Prisma.JobUpdateInput) {
    return this.prisma.job.update({ where: { id }, data, include: WITH_PARTIES });
  }

  /// Usado pelo cálculo de Ganhos — só Jobs concluídos, com o preço do
  /// orçamento aceite (não há tabela Payment ainda, o valor "ganho" é o
  /// valor acordado no Quote).
  findCompletedForProfessional(professionalProfileId: string) {
    return this.prisma.job.findMany({
      where: { quote: { professionalProfileId }, status: 'COMPLETED' },
      include: { quote: true },
      orderBy: { completedAt: 'desc' },
    });
  }
}
