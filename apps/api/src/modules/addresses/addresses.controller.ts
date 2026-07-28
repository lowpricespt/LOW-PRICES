import { BadRequestException, Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Patch, Post } from '@nestjs/common';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { AuthenticatedUser } from '../auth/interfaces/authenticated-user.interface';
import { RequestsService } from '../requests/requests.service';
import { AddressesService } from './addresses.service';
import { UpsertAddressDto } from './dto/upsert-address.dto';
import { UpdateAddressDto } from './dto/update-address.dto';

@Roles('CLIENT')
@Controller('addresses')
export class AddressesController {
  constructor(
    private readonly addressesService: AddressesService,
    private readonly requestsService: RequestsService,
  ) {}

  private async resolveClientId(userId: string): Promise<string> {
    const clientProfileId = await this.requestsService.resolveClientProfileId(userId);
    if (!clientProfileId) throw new BadRequestException('Perfil de cliente não encontrado.');
    return clientProfileId;
  }

  @Get()
  async findMine(@CurrentUser() user: AuthenticatedUser) {
    const clientProfileId = await this.resolveClientId(user.userId);
    return this.addressesService.findMine(clientProfileId);
  }

  @Post()
  async create(@CurrentUser() user: AuthenticatedUser, @Body() dto: UpsertAddressDto) {
    const clientProfileId = await this.resolveClientId(user.userId);
    return this.addressesService.create(clientProfileId, dto);
  }

  @Patch(':id')
  async update(@CurrentUser() user: AuthenticatedUser, @Param('id') id: string, @Body() dto: UpdateAddressDto) {
    const clientProfileId = await this.resolveClientId(user.userId);
    return this.addressesService.update(id, clientProfileId, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@CurrentUser() user: AuthenticatedUser, @Param('id') id: string) {
    const clientProfileId = await this.resolveClientId(user.userId);
    await this.addressesService.remove(id, clientProfileId);
  }
}
