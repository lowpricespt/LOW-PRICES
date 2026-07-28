import { BadRequestException, Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Post } from '@nestjs/common';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { AuthenticatedUser } from '../auth/interfaces/authenticated-user.interface';
import { RequestsService } from '../requests/requests.service';
import { AvailabilityService } from './availability.service';
import { CreateAvailabilityBlockDto } from './dto/create-availability-block.dto';

@Roles('PROFESSIONAL')
@Controller('professionals/me/availability-blocks')
export class AvailabilityController {
  constructor(
    private readonly availabilityService: AvailabilityService,
    private readonly requestsService: RequestsService,
  ) {}

  private async resolveProfessionalId(userId: string): Promise<string> {
    const professional = await this.requestsService.resolveProfessionalProfile(userId);
    if (!professional) throw new BadRequestException('Perfil de profissional não encontrado.');
    return professional.id;
  }

  @Get()
  async findMine(@CurrentUser() user: AuthenticatedUser) {
    const professionalProfileId = await this.resolveProfessionalId(user.userId);
    return this.availabilityService.findMine(professionalProfileId);
  }

  @Post()
  async create(@CurrentUser() user: AuthenticatedUser, @Body() dto: CreateAvailabilityBlockDto) {
    const professionalProfileId = await this.resolveProfessionalId(user.userId);
    return this.availabilityService.create(professionalProfileId, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@CurrentUser() user: AuthenticatedUser, @Param('id') id: string) {
    const professionalProfileId = await this.resolveProfessionalId(user.userId);
    await this.availabilityService.remove(id, professionalProfileId);
  }
}
