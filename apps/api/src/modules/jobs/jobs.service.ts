import { BadRequestException, ForbiddenException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Job, ServiceRequest, Quote, ClientProfile, ProfessionalProfile, User, Review } from '@prisma/client';
import { JobsRepository } from './jobs.repository';
import { RequestsRepository } from '../requests/requests.repository';
import { EmailService } from '../../infra/email/email.service';
import { JobResponseDto } from './dto/job-response.dto';
import type { CancelJobDto } from './dto/cancel-job.dto';

type JobWithParties = Job & {
  serviceRequest: ServiceRequest & { client: ClientProfile & { user: User } };
  quote: Quote & { professionalProfile: ProfessionalProfile & { user: User } };
  review: Review | null;
};

interface RequestingParty {
  clientProfileId?: string | null;
  professionalProfileId?: string | null;
}

@Injectable()
export class JobsService {
  private readonly logger = new Logger(JobsService.name);

  constructor(
    private readonly jobsRepository: JobsRepository,
    private readonly requestsRepository: RequestsRepository,
    private readonly emailService: EmailService,
    private readonly configService: ConfigService,
  ) {}

  private get siteUrl(): string {
    return this.configService.get<string>('CORS_ORIGIN')?.split(',')[0] ?? '';
  }

  private async notifySafely(params: { to: string; subject: string; html: string }, context: string): Promise<void> {
    try {
      await this.emailService.send(params);
    } catch (error) {
      this.logger.error(`Falha ao enviar notificação (${context}): ${error instanceof Error ? error.message : error}`);
    }
  }

  private async loadOwnedJob(jobId: string, professionalProfileId: string): Promise<JobWithParties> {
    const job = await this.jobsRepository.findById(jobId);
    if (!job) throw new NotFoundException('Trabalho não encontrado.');
    if (job.quote.professionalProfileId !== professionalProfileId) {
      throw new ForbiddenException('Este trabalho não te pertence.');
    }
    return job;
  }

  /// Só o Profissional marca início/conclusão — é quem executa o
  /// trabalho. Qualquer uma das partes pode cancelar (ver `cancel`).
  async start(jobId: string, professionalProfileId: string): Promise<JobResponseDto> {
    const job = await this.loadOwnedJob(jobId, professionalProfileId);
    if (job.status !== 'SCHEDULED') {
      throw new BadRequestException('Só é possível iniciar um trabalho agendado.');
    }

    const updated = await this.jobsRepository.updateStatus(jobId, { status: 'IN_PROGRESS' });
    return this.toDto(updated, false);
  }

  async complete(jobId: string, professionalProfileId: string): Promise<JobResponseDto> {
    const job = await this.loadOwnedJob(jobId, professionalProfileId);
    if (!['SCHEDULED', 'IN_PROGRESS'].includes(job.status)) {
      throw new BadRequestException('Este trabalho já não pode ser marcado como concluído.');
    }

    const updated = await this.jobsRepository.updateStatus(jobId, {
      status: 'COMPLETED',
      completedAt: new Date(),
    });
    await this.requestsRepository.update(job.serviceRequestId, { status: 'COMPLETED' });

    await this.notifySafely(
      {
        to: job.serviceRequest.client.user.email,
        subject: 'O teu trabalho foi marcado como concluído — Low Prices',
        html: `
          <p>Olá ${job.serviceRequest.client.user.name},</p>
          <p><strong>${job.quote.professionalProfile.user.name}</strong> marcou o teu pedido de
          <strong>${job.serviceRequest.description.slice(0, 80)}</strong> como concluído.</p>
          <p>Já podes avaliar o serviço:</p>
          <p><a href="${this.siteUrl}/dashboard/cliente/historico">Avaliar profissional</a></p>
        `,
      },
      `job concluído, ${jobId}`,
    );

    return this.toDto(updated, false);
  }

  async cancel(
    jobId: string,
    requester: RequestingParty,
    dto: CancelJobDto,
  ): Promise<JobResponseDto> {
    const job = await this.jobsRepository.findById(jobId);
    if (!job) throw new NotFoundException('Trabalho não encontrado.');

    const isClient = requester.clientProfileId === job.serviceRequest.clientId;
    const isProfessional = requester.professionalProfileId === job.quote.professionalProfileId;
    if (!isClient && !isProfessional) throw new ForbiddenException('Este trabalho não te pertence.');
    if (job.status === 'COMPLETED' || job.status === 'CANCELLED') {
      throw new BadRequestException('Este trabalho já não pode ser cancelado.');
    }

    const updated = await this.jobsRepository.updateStatus(jobId, {
      status: 'CANCELLED',
      cancelledAt: new Date(),
      cancelReason: dto.reason,
    });
    await this.requestsRepository.update(job.serviceRequestId, { status: 'CANCELLED' });

    // Notifica sempre a OUTRA parte — quem cancelou já sabe.
    const notifyTarget = isClient
      ? { to: job.quote.professionalProfile.user.email, name: job.quote.professionalProfile.user.name }
      : { to: job.serviceRequest.client.user.email, name: job.serviceRequest.client.user.name };

    await this.notifySafely(
      {
        to: notifyTarget.to,
        subject: 'Um trabalho foi cancelado — Low Prices',
        html: `
          <p>Olá ${notifyTarget.name},</p>
          <p>O trabalho referente a <strong>${job.serviceRequest.description.slice(0, 80)}</strong> foi cancelado.</p>
          ${dto.reason ? `<p>Motivo: "${dto.reason}"</p>` : ''}
        `,
      },
      `job cancelado, ${jobId}`,
    );

    return this.toDto(updated, isClient);
  }

  async findOne(jobId: string, requester: RequestingParty): Promise<JobResponseDto> {
    const job = await this.jobsRepository.findById(jobId);
    if (!job) throw new NotFoundException('Trabalho não encontrado.');

    const isClient = requester.clientProfileId === job.serviceRequest.clientId;
    const isProfessional = requester.professionalProfileId === job.quote.professionalProfileId;
    if (!isClient && !isProfessional) {
      throw new ForbiddenException('Este trabalho não te pertence.');
    }

    return this.toDto(job, isClient);
  }

  async findMineAsClient(clientProfileId: string): Promise<JobResponseDto[]> {
    const jobs = await this.jobsRepository.findManyForClient(clientProfileId);
    return jobs.map((job) => this.toDto(job, true));
  }

  async findMineAsProfessional(professionalProfileId: string): Promise<JobResponseDto[]> {
    const jobs = await this.jobsRepository.findManyForProfessional(professionalProfileId);
    return jobs.map((job) => this.toDto(job, false));
  }

  /**
   * "Ganhos" — não há tabela Payment nem Stripe ligado ainda (Fase 13),
   * por isso o valor devolvido é o preço do orçamento aceite em cada
   * Job concluído (valor BRUTO acordado, sem dedução de comissão). O DTO
   * inclui uma nota explícita sobre isto — mais honesto do que fingir
   * que é o valor líquido recebido de verdade.
   */
  async getEarningsSummary(professionalProfileId: string) {
    const completedJobs = await this.jobsRepository.findCompletedForProfessional(professionalProfileId);

    const now = new Date();
    const currentMonthJobs = completedJobs.filter(
      (job) =>
        job.completedAt &&
        job.completedAt.getMonth() === now.getMonth() &&
        job.completedAt.getFullYear() === now.getFullYear(),
    );

    const sum = (jobs: typeof completedJobs) => jobs.reduce((total, job) => total + Number(job.quote.price), 0);

    return {
      totalEarned: sum(completedJobs),
      completedJobsCount: completedJobs.length,
      currentMonthEarned: sum(currentMonthJobs),
      currentMonthJobsCount: currentMonthJobs.length,
      note: 'Valores brutos acordados nos orçamentos aceites — os pagamentos reais (Stripe) ainda não estão ligados, por isso não há dedução de comissão nem confirmação de que o pagamento foi efetivamente recebido fora da app.',
    };
  }

  /**
   * @param isRequesterTheClient Decide QUAL das duas partes é "a outra"
   *   — se quem pede é o cliente, devolve o contacto do profissional, e
   *   vice-versa. Nunca devolve o contacto de quem está a pedir.
   */
  private toDto(job: JobWithParties, isRequesterTheClient: boolean): JobResponseDto {
    const otherParty = isRequesterTheClient
      ? {
          name: job.quote.professionalProfile.user.name,
          email: job.quote.professionalProfile.user.email,
          phone: job.quote.professionalProfile.user.phone,
        }
      : {
          name: job.serviceRequest.client.user.name,
          email: job.serviceRequest.client.user.email,
          phone: job.serviceRequest.client.user.phone,
        };

    return {
      id: job.id,
      status: job.status,
      serviceRequestId: job.serviceRequestId,
      quoteId: job.quoteId,
      serviceRequestTitle: job.serviceRequest.description.slice(0, 80),
      price: Number(job.quote.price),
      scheduledStart: job.scheduledStart,
      scheduledEnd: job.scheduledEnd,
      completedAt: job.completedAt,
      hasReview: job.review !== null,
      otherParty,
    };
  }
}
