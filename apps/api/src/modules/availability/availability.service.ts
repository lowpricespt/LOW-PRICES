import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { AvailabilityRepository } from './availability.repository';
import type { CreateAvailabilityBlockDto } from './dto/create-availability-block.dto';

/**
 * Versão mínima de "Agenda": bloqueios de indisponibilidade (férias,
 * folgas). NÃO é o calendário completo com horário semanal recorrente
 * (ver roadmap "Agenda do Profissional") — decisão deliberada para dar
 * conteúdo real à página "Agenda" já, sem esperar pelo desenho do
 * calendário completo. Ainda não filtra o matching (MatchingService
 * continua sem olhar para isto) — é só informativo/visível ao próprio
 * profissional por agora.
 */
@Injectable()
export class AvailabilityService {
  constructor(private readonly availabilityRepository: AvailabilityRepository) {}

  async create(professionalProfileId: string, dto: CreateAvailabilityBlockDto) {
    const startDate = new Date(dto.startDate);
    const endDate = new Date(dto.endDate);
    if (endDate < startDate) {
      throw new BadRequestException('A data de fim tem de ser igual ou posterior à data de início.');
    }

    return this.availabilityRepository.create({
      professionalProfileId,
      startDate,
      endDate,
      reason: dto.reason,
    });
  }

  findMine(professionalProfileId: string) {
    return this.availabilityRepository.findByProfessional(professionalProfileId);
  }

  async remove(id: string, professionalProfileId: string): Promise<void> {
    const block = await this.availabilityRepository.findById(id);
    if (!block) throw new NotFoundException('Bloqueio não encontrado.');
    if (block.professionalProfileId !== professionalProfileId) {
      throw new ForbiddenException('Este bloqueio não te pertence.');
    }
    await this.availabilityRepository.delete(id);
  }
}
