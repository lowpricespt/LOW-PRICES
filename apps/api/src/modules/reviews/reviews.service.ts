import { BadRequestException, ForbiddenException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { ReviewsRepository } from './reviews.repository';
import { JobsRepository } from '../jobs/jobs.repository';
import { EmailService } from '../../infra/email/email.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { ReviewResponseDto } from './dto/review-response.dto';

@Injectable()
export class ReviewsService {
  private readonly logger = new Logger(ReviewsService.name);

  constructor(
    private readonly reviewsRepository: ReviewsRepository,
    private readonly jobsRepository: JobsRepository,
    private readonly emailService: EmailService,
  ) {}

  /**
   * Uma avaliação por Job (@@unique em Review.jobId garante isto também
   * a nível de BD — a verificação aqui é só para dar um erro claro em
   * vez de uma exceção de constraint crua). Só o cliente dono do Job
   * pode avaliar, e só depois de COMPLETED — nunca antes do trabalho
   * ter sido mesmo feito.
   */
  async create(clientProfileId: string, dto: CreateReviewDto): Promise<ReviewResponseDto> {
    const job = await this.jobsRepository.findById(dto.jobId);
    if (!job) throw new NotFoundException('Trabalho não encontrado.');
    if (job.serviceRequest.clientId !== clientProfileId) {
      throw new ForbiddenException('Este trabalho não te pertence.');
    }
    if (job.status !== 'COMPLETED') {
      throw new BadRequestException('Só podes avaliar trabalhos já concluídos.');
    }

    const existing = await this.reviewsRepository.findExistingByJob(dto.jobId);
    if (existing) throw new BadRequestException('Já avaliaste este trabalho.');

    const review = await this.reviewsRepository.create({
      jobId: dto.jobId,
      clientId: clientProfileId,
      professionalProfileId: job.quote.professionalProfileId,
      rating: dto.rating,
      comment: dto.comment,
    });

    try {
      await this.emailService.send({
        to: job.quote.professionalProfile.user.email,
        subject: `Recebeste uma nova avaliação (${dto.rating}/5) — Low Prices`,
        html: `
          <p>Olá ${job.quote.professionalProfile.user.name},</p>
          <p><strong>${job.serviceRequest.client.user.name}</strong> avaliou-te com
          <strong>${dto.rating}/5</strong>.</p>
          ${dto.comment ? `<p>Comentário: "${dto.comment}"</p>` : ''}
        `,
      });
    } catch (error) {
      this.logger.error(`Falha ao notificar nova avaliação: ${error instanceof Error ? error.message : error}`);
    }

    return ReviewResponseDto.fromEntity(review);
  }

  async findForProfessional(professionalProfileId: string) {
    const [items, summary] = await Promise.all([
      this.reviewsRepository.findByProfessional(professionalProfileId),
      this.reviewsRepository.getSummaryForProfessional(professionalProfileId),
    ]);

    return {
      average: summary.average,
      count: summary.count,
      items: items.map(ReviewResponseDto.fromEntityWithClient),
    };
  }
}
