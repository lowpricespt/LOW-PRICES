import { ForbiddenException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JobsRepository } from '../jobs/jobs.repository';
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
    private readonly jobsRepository: JobsRepository,
    private readonly requestsService: RequestsService,
    private readonly emailService: EmailService,
    private readonly configService: ConfigService,
  ) {}

  /**
   * Só o cliente dono ou o profissional do orçamento aceite deste Job
   * podem ver/enviar mensagens — mesma regra de posse usada em
   * JobsService, aqui verificada pelo `userId` (não pelo profileId,
   * porque quem manda a mensagem é sempre a pessoa/User, não o perfil).
   */
  private async loadAuthorizedJob(jobId: string, userId: string) {
    const job = await this.jobsRepository.findById(jobId);
    if (!job) throw new NotFoundException('Trabalho não encontrado.');

    const isClient = job.serviceRequest.client.user.id === userId;
    const isProfessional = job.quote.professionalProfile.user.id === userId;
    if (!isClient && !isProfessional) throw new ForbiddenException('Esta conversa não te pertence.');

    return { job, isClient };
  }

  async findByJob(jobId: string, requester: RequestingUser): Promise<MessageResponseDto[]> {
    const { job } = await this.loadAuthorizedJob(jobId, requester.userId);
    await this.messagesRepository.markReadForViewer(jobId, requester.userId);
    const messages = await this.messagesRepository.findByJob(job.id);
    return messages.map((message) => MessageResponseDto.fromEntity(message, requester.userId));
  }

  async send(jobId: string, requester: RequestingUser, body: string): Promise<MessageResponseDto> {
    const { job, isClient } = await this.loadAuthorizedJob(jobId, requester.userId);

    const message = await this.messagesRepository.create(jobId, requester.userId, body);

    const recipient = isClient ? job.quote.professionalProfile.user : job.serviceRequest.client.user;
    const siteUrl = this.configService.get<string>('CORS_ORIGIN')?.split(',')[0] ?? '';
    const conversationUrl = `${siteUrl}/dashboard/${isClient ? 'profissional' : 'cliente'}/conversas`;

    try {
      await this.emailService.send({
        to: recipient.email,
        subject: 'Nova mensagem — Low Prices',
        html: `
          <p>Olá ${recipient.name},</p>
          <p>Tens uma nova mensagem sobre o trabalho de <strong>${job.serviceRequest.description.slice(0, 80)}</strong>:</p>
          <p>"${body.slice(0, 300)}"</p>
          <p><a href="${conversationUrl}">Responder</a></p>
        `,
      });
    } catch (error) {
      this.logger.error(`Falha ao notificar nova mensagem (job ${jobId}): ${error instanceof Error ? error.message : error}`);
    }

    return MessageResponseDto.fromEntity(message, requester.userId);
  }

  async findMyConversations(userId: string, role: 'CLIENT' | 'PROFESSIONAL') {
    let jobs: Awaited<ReturnType<JobsRepository['findManyForClient']>>;

    if (role === 'CLIENT') {
      const clientProfileId = await this.requestsService.resolveClientProfileId(userId);
      jobs = clientProfileId ? await this.jobsRepository.findManyForClient(clientProfileId) : [];
    } else {
      const professional = await this.requestsService.resolveProfessionalProfile(userId);
      jobs = professional ? await this.jobsRepository.findManyForProfessional(professional.id) : [];
    }

    const conversations = await Promise.all(
      jobs.map(async (job) => {
        const unreadCount = await this.messagesRepository.countUnreadForViewer(job.id, userId);
        const otherParty =
          role === 'CLIENT' ? job.quote.professionalProfile.user.name : job.serviceRequest.client.user.name;
        return {
          jobId: job.id,
          serviceRequestTitle: job.serviceRequest.description.slice(0, 80),
          otherPartyName: otherParty,
          status: job.status,
          unreadCount,
        };
      }),
    );

    return conversations;
  }
}
