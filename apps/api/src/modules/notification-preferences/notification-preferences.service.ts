import { BadRequestException, Injectable } from '@nestjs/common';
import { NotificationPreferencesRepository } from './notification-preferences.repository';
import { RequestsService } from '../requests/requests.service';
import type { UpdateNotificationPreferencesDto } from './dto/update-notification-preferences.dto';

interface CurrentUserRef {
  userId: string;
  role: 'CLIENT' | 'PROFESSIONAL' | 'ADMIN';
}

@Injectable()
export class NotificationPreferencesService {
  constructor(
    private readonly repository: NotificationPreferencesRepository,
    private readonly requestsService: RequestsService,
  ) {}

  private async resolveOwner(user: CurrentUserRef) {
    if (user.role === 'CLIENT') {
      const clientProfileId = await this.requestsService.resolveClientProfileId(user.userId);
      if (!clientProfileId) throw new BadRequestException('Perfil de cliente não encontrado.');
      return { clientProfileId };
    }
    if (user.role === 'PROFESSIONAL') {
      const professional = await this.requestsService.resolveProfessionalProfile(user.userId);
      if (!professional) throw new BadRequestException('Perfil de profissional não encontrado.');
      return { professionalProfileId: professional.id };
    }
    throw new BadRequestException('Contas de administrador não têm preferências de notificação.');
  }

  async getMine(user: CurrentUserRef) {
    const owner = await this.resolveOwner(user);
    return this.repository.findOrCreate(owner);
  }

  async updateMine(user: CurrentUserRef, dto: UpdateNotificationPreferencesDto) {
    const owner = await this.resolveOwner(user);
    const preference = await this.repository.findOrCreate(owner);
    return this.repository.update(preference.id, dto);
  }
}
