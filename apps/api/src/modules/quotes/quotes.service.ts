import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { QuotesRepository } from './quotes.repository';
import { RequestsRepository } from '../requests/requests.repository';
import { QuoteResponseDto } from './dto/quote-response.dto';
import type { CreateQuoteDto } from './dto/create-quote.dto';

@Injectable()
export class QuotesService {
  constructor(
    private readonly quotesRepository: QuotesRepository,
    private readonly requestsRepository: RequestsRepository,
  ) {}

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

    const quote = await this.quotesRepository.create({
      serviceRequestId: dto.serviceRequestId,
      professionalProfileId,
      price: dto.price,
      message: dto.message,
      status: 'SENT',
    });

    if (request.status === 'PUBLISHED') {
      await this.requestsRepository.update(dto.serviceRequestId, { status: 'IN_NEGOTIATION' });
    }
    // TODO (Fase 11 — Notificações): notificar o cliente de que recebeu um
    // novo orçamento (Push/Email/Interna) — ver NOTIFICATIONS_ARCHITECTURE.md.

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
    });
    // TODO (Fase 11): notificar o profissional aceite (e os recusados).

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
