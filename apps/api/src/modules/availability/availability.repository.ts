import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../infra/prisma/prisma.service';

@Injectable()
export class AvailabilityRepository {
  constructor(private readonly prisma: PrismaService) {}

  create(data: { professionalProfileId: string; startDate: Date; endDate: Date; reason?: string }) {
    return this.prisma.availabilityBlock.create({ data });
  }

  findByProfessional(professionalProfileId: string) {
    return this.prisma.availabilityBlock.findMany({
      where: { professionalProfileId },
      orderBy: { startDate: 'asc' },
    });
  }

  findById(id: string) {
    return this.prisma.availabilityBlock.findUnique({ where: { id } });
  }

  delete(id: string) {
    return this.prisma.availabilityBlock.delete({ where: { id } });
  }
}
