import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../infra/prisma/prisma.service';
import { AuditLogService, AuditAction } from '../audit-log/audit-log.service';
import type { UpdateVerificationDto } from './dto/update-verification.dto';

/**
 * Verificação manual de identidade dos Profissionais (ver auditoria de
 * lançamento, Fase A). Antes deste módulo não existia NENHUMA forma de
 * um ProfessionalProfile sair do estado "PENDING" — e o MatchingService
 * só considera profissionais "APPROVED" elegíveis para receber pedidos.
 * Ou seja: sem isto, nenhum profissional registado recebe alguma vez um
 * pedido, mesmo que o resto do fluxo esteja perfeito.
 *
 * Não há painel de administração completo ainda (Fase 15 do roadmap) —
 * este módulo é deliberadamente mínimo (2 endpoints), pensado para um
 * piloto com dezenas de profissionais, não centenas. Quando o volume
 * justificar, evolui para o painel completo sem precisar de reescrever
 * esta lógica.
 */
@Injectable()
export class AdminService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditLog: AuditLogService,
  ) {}

  async listProfessionalsForReview(status: 'PENDING' | 'APPROVED' | 'REJECTED' = 'PENDING') {
    const professionals = await this.prisma.professionalProfile.findMany({
      where: { verificationStatus: status },
      orderBy: { createdAt: 'asc' },
      select: {
        id: true,
        bio: true,
        serviceRadiusKm: true,
        verificationStatus: true,
        createdAt: true,
        user: {
          select: { id: true, name: true, email: true, phone: true, createdAt: true },
        },
        categories: {
          select: { category: { select: { id: true, name: true, slug: true } } },
        },
        documents: {
          select: { id: true, type: true, fileUrl: true, status: true, uploadedAt: true },
          orderBy: { uploadedAt: 'desc' },
        },
        addresses: {
          select: { city: true, postalCode: true },
          take: 1,
        },
      },
    });

    return professionals.map((professional) => ({
      id: professional.id,
      bio: professional.bio,
      serviceRadiusKm: professional.serviceRadiusKm,
      verificationStatus: professional.verificationStatus,
      createdAt: professional.createdAt,
      user: professional.user,
      categories: professional.categories.map((link) => link.category),
      documents: professional.documents,
      city: professional.addresses[0]?.city ?? null,
    }));
  }

  async updateVerification(professionalProfileId: string, dto: UpdateVerificationDto, adminUserId: string) {
    const professional = await this.prisma.professionalProfile.findUnique({
      where: { id: professionalProfileId },
      select: { id: true, userId: true, verificationStatus: true },
    });
    if (!professional) throw new NotFoundException('Perfil de profissional não encontrado.');

    const updated = await this.prisma.professionalProfile.update({
      where: { id: professionalProfileId },
      data: { verificationStatus: dto.status },
      select: { id: true, verificationStatus: true, userId: true },
    });

    await this.auditLog.record({
      userId: adminUserId,
      action: AuditAction.PROFESSIONAL_VERIFICATION_UPDATED,
      metadata: {
        professionalProfileId,
        targetUserId: professional.userId,
        previousStatus: professional.verificationStatus,
        newStatus: dto.status,
        reason: dto.reason ?? null,
      },
    });

    return updated;
  }
}
