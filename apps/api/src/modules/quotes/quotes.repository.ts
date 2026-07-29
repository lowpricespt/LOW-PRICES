import { Injectable } from '@nestjs/common';
import type { Prisma } from '@prisma/client';
import { PrismaService } from '../../infra/prisma/prisma.service';

const WITH_PROFESSIONAL = {
  professionalProfile: { include: { user: true } },
} satisfies Prisma.QuoteInclude;

/// Usado para autorizar/mostrar conversas — precisa das duas partes
/// (cliente dono do pedido + profissional do orçamento), ao contrário de
/// WITH_PROFESSIONAL que só serve o lado do profissional.
const WITH_PARTIES = {
  professionalProfile: { include: { user: true } },
  serviceRequest: { include: { client: { include: { user: true } } } },
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

  findByIdWithParties(id: string) {
    return this.prisma.quote.findUnique({ where: { id }, include: WITH_PARTIES });
  }

  findByServiceRequest(serviceRequestId: string) {
    return this.prisma.quote.findMany({
      where: { serviceRequestId },
      include: WITH_PROFESSIONAL,
      orderBy: { createdAt: 'desc' },
    });
  }

  /// Todos os orçamentos que este profissional já enviou, em qualquer
  /// pedido — alimenta "Conversas" do lado do profissional (a conversa
  /// existe desde que o orçamento foi enviado, não só depois de aceite).
  findManyByProfessional(professionalProfileId: string) {
    return this.prisma.quote.findMany({
      where: { professionalProfileId },
      include: WITH_PARTIES,
      orderBy: { createdAt: 'desc' },
    });
  }

  /// Todos os orçamentos recebidos em qualquer pedido deste cliente —
  /// alimenta "Conversas" do lado do cliente.
  findManyForClient(clientProfileId: string) {
    return this.prisma.quote.findMany({
      where: { serviceRequest: { clientId: clientProfileId } },
      include: WITH_PARTIES,
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
