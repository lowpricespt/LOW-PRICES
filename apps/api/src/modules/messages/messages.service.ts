import { ForbiddenException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { QuotesRepository } from '../quotes/quotes.repository';
import { RequestsService } from '../requests/requests.service';
import { EmailService } from '../../infra/email/email.service';
import { MessagesRepository } from './messages.repository';
import { MessageResponseDto } from './dto/message-response.dto';

interface RequestingUser {
  userId: string;
}

@Injectable()
export class MessagesService {
  private readonly logger = new Logger(MessagesService.name);

  constructor(
    private readonly messagesRepository: MessagesRepository,
    private readonly quotesRepository: QuotesRepository,
    private readonly requestsService: RequestsService,
    private readonly emailService: EmailService,
    private readonly configService: ConfigService,
  ) {}

  /**
   * A conversa começa assim que o profissional envia um orçamento — não
   * é preciso o cliente já o ter aceite. Só o cliente dono do pedido ou
   * o profissional que enviou este orçamento podem ver/enviar mensagens.
   */
  private async loadAuthorizedQuote(quoteId: string, userId: string) {
    const quote = await this.quotesRepository.findByIdWithParties(quoteId);
    if (!quote) throw new NotFoundException('Orçamento não encontrado.');

    const isClient = quote.serviceRequest.client.user.id === userId;
    const isProfessional = quote.professionalProfile.user.id === userId;
    if (!isClient && !isProfessional) throw new ForbiddenException('Esta conversa não te pertence.');

    return { quote, isClient };
  }

  async findByQuote(quoteId: string, requester: RequestingUser): Promise<MessageResponseDto[]> {
    const { quote } = await this.loadAuthorizedQuote(quoteId, requester.userId);
    await this.messagesRepository.markReadForViewer(quoteId, requester.userId);
    const messages = await this.messagesRepository.findByQuote(quote.id);
    return messages.map((message) => MessageResponseDto.fromEntity(message, requester.userId));
  }

  async send(quoteId: string, requester: RequestingUser, body: string): Promise<MessageResponseDto> {
    const { quote, isClient } = await this.loadAuthorizedQuote(quoteId, requester.userId);

    const message = await this.messagesRepository.create(quoteId, requester.userId, body);

    const recipient = isClient ? quote.professionalProfile.user : quote.serviceRequest.client.user;
    const siteUrl = this.configService.get<string>('CORS_ORIGIN')?.split(',')[0] ?? '';
    const conversationUrl = `${siteUrl}/dashboard/${isClient ? 'profissional' : 'cliente'}/conversas`;

    try {
      await this.emailService.send({
        to: recipient.email,
        subject: 'Nova mensagem — Low Prices',
        html: `
          <p>Olá ${recipient.name},</p>
          <p>Tens uma nova mensagem sobre o pedido de <strong>${quote.serviceRequest.description.slice(0, 80)}</strong>:</p>
          <p>"${body.slice(0, 300)}"</p>
          <p><a href="${conversationUrl}">Responder</a></p>
        `,
      });
    } catch (error) {
      this.logger.error(`Falha ao notificar nova mensagem (orçamento ${quoteId}): ${error instanceof Error ? error.message : error}`);
    }

    return MessageResponseDto.fromEntity(message, requester.userId);
  }

  async findMyConversations(userId: string, role: 'CLIENT' | 'PROFESSIONAL') {
    let quotes: Awaited<ReturnType<QuotesRepository['findManyForClient']>>;

    if (role === 'CLIENT') {
      const clientProfileId = await this.requestsService.resolveClientProfileId(userId);
      quotes = clientProfileId ? await this.quotesRepository.findManyForClient(clientProfileId) : [];
    } else {
      const professional = await this.requestsService.resolveProfessionalProfile(userId);
      quotes = professional ? await this.quotesRepository.findManyByProfessional(professional.id) : [];
    }

    const conversations = await Promise.all(
      quotes.map(async (quote) => {
        const unreadCount = await this.messagesRepository.countUnreadForViewer(quote.id, userId);
        const otherParty =
          role === 'CLIENT' ? quote.professionalProfile.user.name : quote.serviceRequest.client.user.name;
        return {
          quoteId: quote.id,
          serviceRequestTitle: quote.serviceRequest.description.slice(0, 80),
          otherPartyName: otherParty,
          status: quote.status,
          unreadCount,
        };
      }),
    );

    return conversations;
  }
}
