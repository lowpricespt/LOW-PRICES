import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import type { Job, ServiceRequest, Quote, ClientProfile, ProfessionalProfile, User } from '@prisma/client';
import { JobsRepository } from './jobs.repository';
import { JobResponseDto } from './dto/job-response.dto';

type JobWithParties = Job & {
  serviceRequest: ServiceRequest & { client: ClientProfile & { user: User } };
  quote: Quote & { professionalProfile: ProfessionalProfile & { user: User } };
};

interface RequestingParty {
  clientProfileId?: string | null;
  professionalProfileId?: string | null;
}

@Injectable()
export class JobsService {
  constructor(private readonly jobsRepository: JobsRepository) {}

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
      otherParty,
    };
  }
}
