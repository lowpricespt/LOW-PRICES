import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../infra/prisma/prisma.service';

export interface EligibleProfessional {
  professionalProfileId: string;
}

@Injectable()
export class MatchingService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Encontra profissionais elegíveis para um pedido publicado.
   *
   * Filtros ATIVOS agora:
   *  - categoria (ou subcategoria — ver nota abaixo)
   *  - conta ativa (User.status = ACTIVE)
   *  - perfil verificado (ProfessionalProfile.verificationStatus = APPROVED)
   *
   * Filtros DOCUMENTADOS, ainda não aplicados (motivo em cada linha):
   *  - localização/raio: precisa da migração PostGIS (ver
   *    00-FUNDACAO-TECNICA.md) — filtrar em memória por Haversine seria
   *    aceitável até algumas centenas de profissionais, mas não escala;
   *    preferimos não fingir que está pronto para produção.
   *  - disponibilidade: precisa do módulo Agenda (AvailabilityRule/
   *    AvailabilityBlock), que ainda não foi construído.
   *  - documentos aprovados: hoje só existe `Document.status`, mas não
   *    há regra que exija TODOS os documentos obrigatórios aprovados
   *    (vs. pelo menos um) — decisão de produto a confirmar antes de
   *    implementar, para não travar profissionais por engano.
   *
   * Categoria vs. subcategoria: se o pedido tem uma subcategoria
   * (`ServiceCategory.parentId` preenchido), um profissional que cobre
   * só a categoria-mãe TAMBÉM é considerado elegível (é comum um
   * profissional não filtrar ao nível mais fino) — mas um profissional
   * que só cobre uma subcategoria diferente da mesma categoria-mãe não é.
   */
  async findEligibleProfessionals(categoryId: string): Promise<EligibleProfessional[]> {
    const category = await this.prisma.serviceCategory.findUnique({
      where: { id: categoryId },
      select: { id: true, parentId: true },
    });
    if (!category) return [];

    const candidateCategoryIds = category.parentId ? [category.id, category.parentId] : [category.id];

    const professionals = await this.prisma.professionalProfile.findMany({
      where: {
        verificationStatus: 'APPROVED',
        user: { status: 'ACTIVE' },
        categories: { some: { categoryId: { in: candidateCategoryIds } } },
      },
      select: { id: true },
    });

    return professionals.map((professional) => ({ professionalProfileId: professional.id }));
  }
}
