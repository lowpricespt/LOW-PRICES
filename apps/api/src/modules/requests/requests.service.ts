import { ForbiddenException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { RequestsRepository } from './requests.repository';
import { ServiceRequestResponseDto } from './dto/service-request-response.dto';
import type { CreateServiceRequestDto } from './dto/create-service-request.dto';
import type { ListRequestsQueryDto } from './dto/list-requests-query.dto';
import { MatchingService } from '../matching/matching.service';
import { EmailService } from '../../infra/email/email.service';

const URGENCY_LABELS: Record<string, string> = {
  hoje: 'Hoje',
  'esta-semana': 'Esta semana',
  'este-mes': 'Este mês',
  'sem-urgencia': 'Sem urgência',
};

@Injectable()
export class RequestsService {
  private readonly logger = new Logger(RequestsService.name);

  constructor(
    private readonly requestsRepository: RequestsRepository,
    private readonly matchingService: MatchingService,
    private readonly emailService: EmailService,
    private readonly configService: ConfigService,
  ) {}

  async create(clientId: string, dto: CreateServiceRequestDto): Promise<ServiceRequestResponseDto> {
    const entity = await this.requestsRepository.create({
      clientId,
      categoryId: dto.categoryId,
      description: dto.description,
      photoUrls: dto.photoUrls ?? [],
      location: dto.location,
      latitude: dto.latitude,
      longitude: dto.longitude,
      urgency: dto.urgency,
      budget: dto.budget,
      status: 'DRAFT',
    });
    // O dono (cliente) vê sempre a localização completa — o seu próprio pedido.
    return ServiceRequestResponseDto.fromEntity(entity, true);
  }

  /**
   * DRAFT -> PUBLISHED. Identifica profissionais elegíveis pela
   * categoria, regista o "match" (notifiedAt) e envia-lhes um email real
   * (via Resend) — substitui o TODO da Fase 11 para o canal Email; Push/
   * SMS/Interna continuam por implementar (ver NOTIFICATIONS_ARCHITECTURE.md).
   */
  async publish(id: string, clientId: string): Promise<ServiceRequestResponseDto> {
    const request = await this.requestsRepository.findById(id);
    if (!request) throw new NotFoundException('Pedido não encontrado.');
    if (request.clientId !== clientId) throw new ForbiddenException('Este pedido não te pertence.');

    const updated = await this.requestsRepository.update(id, {
      status: 'PUBLISHED',
      publishedAt: new Date(),
    });

    const eligibleProfessionals = await this.matchingService.findEligibleProfessionals(request.categoryId);
    await Promise.all(
      eligibleProfessionals.map((professional) =>
        this.requestsRepository.createMatch(id, professional.professionalProfileId),
      ),
    );

    await this.notifyEligibleProfessionals(updated, eligibleProfessionals);

    return ServiceRequestResponseDto.fromEntity(updated, true);
  }

  /**
   * Envio best-effort: uma falha a notificar um profissional (Resend em
   * baixo, email inválido, etc.) nunca pode fazer falhar a publicação do
   * pedido para o cliente — por isso cada envio é isolado com o seu
   * próprio try/catch, nunca um Promise.all que rejeitaria tudo ao
   * primeiro erro.
   */
  private async notifyEligibleProfessionals(
    request: { id: string; description: string; urgency: string; budget: unknown; location: string; category: { name: string } },
    professionals: Awaited<ReturnType<MatchingService['findEligibleProfessionals']>>,
  ): Promise<void> {
    const siteUrl = this.configService.get<string>('CORS_ORIGIN')?.split(',')[0] ?? '';
    const dashboardUrl = `${siteUrl}/dashboard/profissional/pedidos-disponiveis`;
    const urgencyLabel = URGENCY_LABELS[request.urgency] ?? request.urgency;
    const budget = request.budget ? `${Number(request.budget).toFixed(2)} €` : 'Não definido';

    await Promise.all(
      professionals.map(async (professional) => {
        // Mesma regra do resto da app: só quem tem Acesso à Área ativo vê
        // a localização exata — nunca a revelar "por engano" aqui.
        const location = professional.hasActiveAreaAccess
          ? request.location
          : 'Disponível para quem tem Acesso à Área ativo.';

        try {
          await this.emailService.send({
            to: professional.email,
            subject: `Novo pedido de ${request.category.name} perto de ti — Low Prices`,
            html: `
              <p>Olá ${professional.name},</p>
              <p>Há um novo pedido na tua categoria (<strong>${request.category.name}</strong>):</p>
              <p>${request.description}</p>
              <ul>
                <li><strong>Urgência:</strong> ${urgencyLabel}</li>
                <li><strong>Orçamento indicado:</strong> ${budget}</li>
                <li><strong>Localização:</strong> ${location}</li>
              </ul>
              <p><a href="${dashboardUrl}">Ver pedido e enviar orçamento</a></p>
            `,
          });
        } catch (error) {
          this.logger.error(
            `Falha ao notificar profissional ${professional.professionalProfileId} sobre o pedido ${request.id}: ${error instanceof Error ? error.message : error}`,
          );
        }
      }),
    );
  }

  /**
   * @param requestingUser Quem está a pedir — decide se a localização
   *   vem completa (cliente dono, ou profissional com plano ativo) ou
   *   ocultada (profissional sem plano, ou qualquer outro caso).
   */
  async findOne(
    id: string,
    requestingUser: { role: 'CLIENT' | 'PROFESSIONAL'; clientProfileId?: string | null; hasActiveAreaAccess?: boolean },
  ): Promise<ServiceRequestResponseDto> {
    const entity = await this.requestsRepository.findById(id);
    if (!entity) throw new NotFoundException('Pedido não encontrado.');

    const isOwner = requestingUser.role === 'CLIENT' && entity.clientId === requestingUser.clientProfileId;
    const unlocked = isOwner || Boolean(requestingUser.hasActiveAreaAccess);

    return ServiceRequestResponseDto.fromEntity(entity, unlocked);
  }

  async findMine(clientId: string, query: ListRequestsQueryDto) {
    const { items, total } = await this.requestsRepository.findManyByClient(clientId, query.page, query.pageSize);
    return {
      items: items.map((item) => ServiceRequestResponseDto.fromEntity(item, true)),
      page: query.page,
      pageSize: query.pageSize,
      total,
    };
  }

  async findAvailable(
    categoryIds: string[],
    professionalProfileId: string,
    hasActiveAreaAccess: boolean,
    query: ListRequestsQueryDto,
  ) {
    const { items, total } = await this.requestsRepository.findAvailableForProfessional(
      categoryIds,
      professionalProfileId,
      query.page,
      query.pageSize,
    );
    return {
      items: items.map((item) => ServiceRequestResponseDto.fromEntity(item, hasActiveAreaAccess)),
      page: query.page,
      pageSize: query.pageSize,
      total,
      isLocationUnlocked: hasActiveAreaAccess,
    };
  }

  resolveClientProfileId(userId: string) {
    return this.requestsRepository.findClientProfileIdByUserId(userId);
  }

  resolveProfessionalProfile(userId: string) {
    return this.requestsRepository.findProfessionalProfileByUserId(userId);
  }
}
