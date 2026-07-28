import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../infra/prisma/prisma.service';
import type { UpsertAddressDto } from './dto/upsert-address.dto';
import type { UpdateAddressDto } from './dto/update-address.dto';

@Injectable()
export class AddressesRepository {
  constructor(private readonly prisma: PrismaService) {}

  findByClient(clientProfileId: string) {
    return this.prisma.address.findMany({
      where: { clientProfileId },
      orderBy: [{ isDefault: 'desc' }, { label: 'asc' }],
    });
  }

  findById(id: string) {
    return this.prisma.address.findUnique({ where: { id } });
  }

  create(clientProfileId: string, dto: UpsertAddressDto) {
    return this.prisma.address.create({ data: { clientProfileId, ...dto } });
  }

  update(id: string, dto: UpdateAddressDto) {
    return this.prisma.address.update({ where: { id }, data: dto });
  }

  delete(id: string) {
    return this.prisma.address.delete({ where: { id } });
  }

  /// Garante que só um endereço do cliente fica marcado como default —
  /// corre antes de criar/atualizar um endereço com isDefault=true.
  clearDefaultForClient(clientProfileId: string) {
    return this.prisma.address.updateMany({
      where: { clientProfileId, isDefault: true },
      data: { isDefault: false },
    });
  }
}
