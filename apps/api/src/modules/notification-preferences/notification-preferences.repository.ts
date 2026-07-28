import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../infra/prisma/prisma.service';

interface OwnerRef {
  clientProfileId?: string;
  professionalProfileId?: string;
}

@Injectable()
export class NotificationPreferencesRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findOrCreate(owner: OwnerRef) {
    const where = owner.clientProfileId
      ? { clientProfileId: owner.clientProfileId }
      : { professionalProfileId: owner.professionalProfileId };

    const existing = await this.prisma.notificationPreference.findFirst({ where });
    if (existing) return existing;

    return this.prisma.notificationPreference.create({
      data: owner.clientProfileId
        ? { clientProfileId: owner.clientProfileId }
        : { professionalProfileId: owner.professionalProfileId },
    });
  }

  update(id: string, data: { emailEnabled?: boolean; pushEnabled?: boolean; smsEnabled?: boolean }) {
    return this.prisma.notificationPreference.update({ where: { id }, data });
  }
}
