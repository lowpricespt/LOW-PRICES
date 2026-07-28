import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { AddressesRepository } from './addresses.repository';
import type { UpsertAddressDto } from './dto/upsert-address.dto';
import type { UpdateAddressDto } from './dto/update-address.dto';

@Injectable()
export class AddressesService {
  constructor(private readonly addressesRepository: AddressesRepository) {}

  findMine(clientProfileId: string) {
    return this.addressesRepository.findByClient(clientProfileId);
  }

  async create(clientProfileId: string, dto: UpsertAddressDto) {
    if (dto.isDefault) {
      await this.addressesRepository.clearDefaultForClient(clientProfileId);
    }
    return this.addressesRepository.create(clientProfileId, dto);
  }

  async update(id: string, clientProfileId: string, dto: UpdateAddressDto) {
    const address = await this.addressesRepository.findById(id);
    if (!address) throw new NotFoundException('Morada não encontrada.');
    if (address.clientProfileId !== clientProfileId) throw new ForbiddenException('Esta morada não te pertence.');

    if (dto.isDefault) {
      await this.addressesRepository.clearDefaultForClient(clientProfileId);
    }
    return this.addressesRepository.update(id, dto);
  }

  async remove(id: string, clientProfileId: string): Promise<void> {
    const address = await this.addressesRepository.findById(id);
    if (!address) throw new NotFoundException('Morada não encontrada.');
    if (address.clientProfileId !== clientProfileId) throw new ForbiddenException('Esta morada não te pertence.');
    await this.addressesRepository.delete(id);
  }
}
