import { BadRequestException, ForbiddenException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { QuotesRepository } from './quotes.repository';
import { RequestsRepository } from '../requests/requests.repository';
import { QuoteResponseDto } from './dto/quote-response.dto';
import type { CreateQuoteDto } from './dto/create-quote.dto';
import { EmailService } from '../../infra/email/email.service';

@Injectable()
export class QuotesService {
  private readonly logger = new Logger(QuotesService.name);

  constructor(
    private readonly quotesRepository: QuotesRepository,
    private readonly requestsRepository: RequestsRepository,
    private readonly emailService: EmailService,
    private readonly configService: ConfigService,
  ) {}

  private get dashboardBaseUrl(): string {
    return this.configService.get<string>('CORS_ORIGIN')?.split(',')[0] ?? '';
  }

  /// Nunca deixar uma falha de email derrubar a operação principal
  /// (aceitar/enviar orçamento) — mesma postura best-effort do
  /// RequestsService.publish.
  private async notifySafely(params: { to: string; subject: string; html: string }, context: string): Promise<void> {
    try {
      await this.emailService.send(params);
    } catch (error) {
      this.logger.error(`Falha ao enviar notificação (${context}): ${error instanceof Error ? error.message : error}`);
    }
  }

  /**
   * Um profissional envia um orçamento a um pedido publicado. Regras:
   * - o pedido tem de existir e estar PUBLISHED ou IN_NEGOTIATION;
   * - um profissional só pode ter UM orçamento ativo por pedido (evita spam).
   */
  async create(professionalProfileId: string, dto: CreateQuoteDto): Promise<QuoteResponseDto> {
    const request = await this.requestsRepository.findById(dto.serviceRequestId);
    if (!request) throw new NotFoundException('Pedido não encontrado.');
    if (!['PUBLISHED', 'IN_NEGOTIATION'].includes(request.status)) {
      throw new BadRequestException('Este pedido já não está a aceitar orçamentos.');
    }

    const existing = await this.quotesRepository.findExisting(dto.serviceRequestId, professionalProfileId);
    if (existing) throw new BadRequestException('Já enviaste um orçamento para este pedido.');

    if (dto.proposedStart && dto.proposedEnd && new Date(dto.proposedEnd) <= new Date(dto.proposedStart)) {
      throw new BadRequestException('A hora de fim proposta tem de ser depois da hora de início.');
    }

    const quote = await this.quotesRepository.create({
      serviceRequestId: dto.serviceRequestId,
      professionalProfileId,
      price: dto.price,
      message: dto.message,
      status: 'SENT',
      proposedStart: dto.proposedStart ? new Date(dto.proposedStart) : undefined,
      proposedEnd: dto.proposedEnd ? new Date(dto.proposedEnd) : undefined,
    });

    if (request.status === 'PUBLISHED') {
      await this.requestsRepository.update(dto.serviceRequestId, { status: 'IN_NEGOTIATION' });
    }

    const client = await this.requestsRepository.findClientContactByProfileId(request.clientId);
    if (client) {
      await this.notifySafely(
        {
          to: client.email,
          subject: `Recebeste um novo orçamento — ${request.category.name}`,
          html: `
            <p>Olá ${client.name},</p>
            <p><strong>${quote.professionalProfile.user.name}</strong> enviou-te um orçamento de
            <strong>${Number(quote.price).toFixed(2)} €</strong> para o teu pedido de
            <strong>${request.category.name}</strong>.</p>
            ${quote.message ? `<p>Mensagem: "${quote.message}"</p>` : ''}
            <p><a href="${this.dashboardBaseUrl}/dashboard/cliente/propostas">Ver orçamento</a></p>
          `,
        },
        `novo orçamento, pedido ${request.id}`,
      );
    }
    // Notificação Push/Interna continua por implementar (Fase 11) — Email
    // já está ligado.

    return QuoteResponseDto.fromEntity(quote);
  }

  async findByServiceRequest(serviceRequestId: string): Promise<QuoteResponseDto[]> {
    const quotes = await this.quotesRepository.findByServiceRequest(serviceRequestId);
    return quotes.map(QuoteResponseDto.fromEntity);
  }

  /**
   * O cliente aceita um orçamento: o Quote passa a ACCEPTED, todos os
   * outros orçamentos SENT do mesmo pedido passam a REJECTED
   * automaticamente, o pedido passa a SCHEDULED, e cria-se o Job — o
   * momento exato em que o "pedido" (ServiceRequest) se transforma em
   * "trabalho real" (Job), conforme o ciclo de vida documentado em
   * CORE_PLATFORM_ARCHITECTURE.md.
   */
  async accept(quoteId: string, clientProfileId: string): Promise<QuoteResponseDto> {
    const quote = await this.quotesRepository.findById(quoteId);
    if (!quote) throw new NotFoundException('Orçamento não encontrado.');

    const request = await this.requestsRepository.findById(quote.serviceRequestId);
    if (!request) throw new NotFoundException('Pedido não encontrado.');
    if (request.clientId !== clientProfileId) throw new ForbiddenException('Este pedido não te pertence.');
    if (quote.status !== 'SENT') throw new BadRequestException('Este orçamento já foi respondido.');

    const updated = await this.quotesRepository.update(quoteId, { status: 'ACCEPTED', respondedAt: new Date() });
    await this.quotesRepository.rejectOthers(quote.serviceRequestId, quoteId);
    await this.requestsRepository.update(quote.serviceRequestId, { status: 'SCHEDULED' });
    await this.quotesRepository.createJob({
      serviceRequestId: quote.serviceRequestId,
      quoteId: quote.id,
      status: 'SCHEDULED',
      // Se o profissional já propôs data/hora ao enviar o orçamento, o
      // trabalho nasce já agendado — não fica parado em "por agendar" na
      // Agenda à espera de um passo manual extra.
      scheduledStart: quote.proposedStart ?? undefined,
      scheduledEnd: quote.proposedEnd ?? undefined,
    });

    await this.notifySafely(
      {
        to: updated.professionalProfile.user.email,
        subject: `O teu orçamento foi aceite — ${request.category.name}`,
        html: `
          <p>Olá ${updated.professionalProfile.user.name},</p>
          <p>O teu orçamento para o pedido de <strong>${request.category.name}</strong> foi aceite. Já podes
          ver o contacto do cliente na secção "Trabalhos aceites" do teu painel.</p>
          <p><a href="${this.dashboardBaseUrl}/dashboard/profissional/trabalhos-aceites">Ver trabalho</a></p>
        `,
      },
      `orçamento aceite, pedido ${quote.serviceRequestId}`,
    );
    // Notificar os profissionais cujos orçamentos foram automaticamente
    // rejeitados fica por implementar (Fase 11) — não bloqueia o loop
    // principal (cliente <-> profissional aceite).

    return QuoteResponseDto.fromEntity(updated);
  }

  async reject(quoteId: string, clientProfileId: string): Promise<QuoteResponseDto> {
    const quote = await this.quotesRepository.findById(quoteId);
    if (!quote) throw new NotFoundException('Orçamento não encontrado.');

    const request = await this.requestsRepository.findById(quote.serviceRequestId);
    if (!request) throw new NotFoundException('Pedido não encontrado.');
    if (request.clientId !== clientProfileId) throw new ForbiddenException('Este pedido não te pertence.');
    if (quote.status !== 'SENT') throw new BadRequestException('Este orçamento já foi respondido.');

    const updated = await this.quotesRepository.update(quoteId, { status: 'REJECTED', respondedAt: new Date() });
    return QuoteResponseDto.fromEntity(updated);
  }
}
