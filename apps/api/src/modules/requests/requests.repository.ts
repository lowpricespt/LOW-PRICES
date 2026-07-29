import { Injectable } from '@nestjs/common';
import type { Prisma } from '@prisma/client';
import { PrismaService } from '../../infra/prisma/prisma.service';

const WITH_CATEGORY = { category: true } satisfies Prisma.ServiceRequestInclude;

@Injectable()
export class RequestsRepository {
  constructor(private readonly prisma: PrismaService) {}

  create(data: Prisma.ServiceRequestUncheckedCreateInput) {
    return this.prisma.serviceRequest.create({ data, include: WITH_CATEGORY });
  }

  findById(id: string) {
    return this.prisma.serviceRequest.findUnique({ where: { id }, include: WITH_CATEGORY });
  }

  update(id: string, data: Prisma.ServiceRequestUpdateInput) {
    return this.prisma.serviceRequest.update({ where: { id }, data, include: WITH_CATEGORY });
  }

  async findManyByClient(clientId: string, page: number, pageSize: number) {
    const where: Prisma.ServiceRequestWhereInput = { clientId };
    const [items, total] = await this.prisma.$transaction([
      this.prisma.serviceRequest.findMany({
        where,
        include: { ...WITH_CATEGORY, _count: { select: { quotes: true } } },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      this.prisma.serviceRequest.count({ where }),
    ]);
    return { items, total };
  }

  /**
   * "Pedidos disponíveis" de um profissional: publicados OU já em
   * negociação (pelo menos um orçamento enviado por OUTRO profissional),
   * na(s) categoria(s) que o profissional atende. O filtro por
   * localização/raio (PostGIS) entra quando a migração espacial for
   * ativada — por agora filtra só por categoria, o resto fica
   * documentado como próximo passo.
   *
   * BUG CRÍTICO corrigido aqui: esta query só incluía `status:
   * 'PUBLISHED'`, mas `QuotesService.create` já aceitava orçamentos em
   * pedidos `IN_NEGOTIATION` (o estado que o pedido assume assim que
   * QUALQUER profissional envia o primeiro orçamento). Resultado: assim
   * que um profissional enviava o primeiro orçamento, o pedido
   * desaparecia de "Pedidos disponíveis" para TODOS os outros
   * profissionais elegíveis — quebrando o propósito central do
   * marketplace (o cliente comparar vários orçamentos antes de aceitar).
   *
   * Inclui `quotes` filtrado pelo PRÓPRIO profissional (no máximo 1,
   * @@unique([serviceRequestId, professionalProfileId]) não existe mas a
   * regra de negócio em QuotesService impede duplicados) — permite à UI
   * saber se já respondeu a este pedido sem uma query extra por item.
   */
  async findAvailableForProfessional(
    categoryIds: string[],
    professionalProfileId: string,
    page: number,
    pageSize: number,
  ) {
    const where: Prisma.ServiceRequestWhereInput = {
      status: { in: ['PUBLISHED', 'IN_NEGOTIATION'] },
      categoryId: { in: categoryIds },
    };
    const [items, total] = await this.prisma.$transaction([
      this.prisma.serviceRequest.findMany({
        where,
        include: {
          ...WITH_CATEGORY,
          _count: { select: { quotes: true } },
          quotes: { where: { professionalProfileId } },
        },
        orderBy: { publishedAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      this.prisma.serviceRequest.count({ where }),
    ]);
    return { items, total };
  }

  createMatch(serviceRequestId: string, professionalProfileId: string) {
    return this.prisma.serviceRequestMatch.create({
      data: { serviceRequestId, professionalProfileId, notifiedAt: new Date() },
    });
  }

  /**
   * O token de acesso só contém `User.id` — estes dois helpers resolvem
   * o perfil correspondente, necessário porque `ServiceRequest.clientId`
   * e `Quote.professionalProfileId` referenciam o perfil, não o User.
   */
  async findClientProfileIdByUserId(userId: string): Promise<string | null> {
    const profile = await this.prisma.clientProfile.findUnique({ where: { userId }, select: { id: true } });
    return profile?.id ?? null;
  }

  /// Usado para notificar o cliente por email (novo orçamento, etc.) —
  /// ServiceRequest.clientId referencia o ClientProfile, não o User.
  async findClientContactByProfileId(clientProfileId: string): Promise<{ email: string; name: string } | null> {
    const profile = await this.prisma.clientProfile.findUnique({
      where: { id: clientProfileId },
      select: { user: { select: { email: true, name: true } } },
    });
    return profile?.user ?? null;
  }

  async findProfessionalProfileByUserId(userId: string): Promise<{
    id: string;
    categoryIds: string[];
    hasActiveAreaAccess: boolean;
    verificationStatus: string;
  } | null> {
    const profile = await this.prisma.professionalProfile.findUnique({
      where: { userId },
      select: {
        id: true,
        hasAreaAccess: true,
        areaAccessExpiresAt: true,
        verificationStatus: true,
        categories: { select: { categoryId: true } },
      },
    });
    if (!profile) return null;
    const hasActiveAreaAccess =
      profile.hasAreaAccess && (!profile.areaAccessExpiresAt || profile.areaAccessExpiresAt > new Date());
    return {
      id: profile.id,
      categoryIds: profile.categories.map((c) => c.categoryId),
      hasActiveAreaAccess,
      verificationStatus: profile.verificationStatus,
    };
  }
}
