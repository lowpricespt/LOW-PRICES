import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { RequestsRepository } from './requests.repository';
import { ServiceRequestResponseDto } from './dto/service-request-response.dto';
import type { CreateServiceRequestDto } from './dto/create-service-request.dto';
import type { ListRequestsQueryDto } from './dto/list-requests-query.dto';
import { MatchingService } from '../matching/matching.service';

@Injectable()
export class RequestsService {
  constructor(
    private readonly requestsRepository: RequestsRepository,
    private readonly matchingService: MatchingService,
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
   * DRAFT -> PUBLISHED. Este é o gatilho do fluxo descrito em
   * NOTIFICATIONS_ARCHITECTURE.md: identifica profissionais elegíveis
   * pela categoria e regista o "match" (notifiedAt) — o ENVIO real
   * (push/email/sms) ainda não está ligado (ver TODO abaixo).
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
    // TODO (Fase 11 — Notificações): disparar aqui os
    // NotificationChannelSender (Push/Email/SMS/Interna) para cada
    // eligibleProfessionals — a lista de destinatários já está correta,
    // só falta o envio real.

    return ServiceRequestResponseDto.fromEntity(updated, true);
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

  async findAvailable(categoryIds: string[], hasActiveAreaAccess: boolean, query: ListRequestsQueryDto) {
    const { items, total } = await this.requestsRepository.findAvailableForProfessional(
      categoryIds,
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
