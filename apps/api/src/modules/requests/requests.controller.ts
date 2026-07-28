import { BadRequestException, Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { AuthenticatedUser } from '../auth/interfaces/authenticated-user.interface';
import { RequestsService } from './requests.service';
import { CreateServiceRequestDto } from './dto/create-service-request.dto';
import { ListRequestsQueryDto } from './dto/list-requests-query.dto';

@Controller('requests')
export class RequestsController {
  constructor(private readonly requestsService: RequestsService) {}

  @Roles('CLIENT')
  @Post()
  async create(@CurrentUser() user: AuthenticatedUser, @Body() dto: CreateServiceRequestDto) {
    const clientProfileId = await this.requestsService.resolveClientProfileId(user.userId);
    if (!clientProfileId) throw new BadRequestException('Perfil de cliente não encontrado.');
    return this.requestsService.create(clientProfileId, dto);
  }

  @Roles('CLIENT')
  @Post(':id/publish')
  async publish(@CurrentUser() user: AuthenticatedUser, @Param('id') id: string) {
    const clientProfileId = await this.requestsService.resolveClientProfileId(user.userId);
    if (!clientProfileId) throw new BadRequestException('Perfil de cliente não encontrado.');
    return this.requestsService.publish(id, clientProfileId);
  }

  @Roles('CLIENT')
  @Get('me')
  async findMine(@CurrentUser() user: AuthenticatedUser, @Query() query: ListRequestsQueryDto) {
    const clientProfileId = await this.requestsService.resolveClientProfileId(user.userId);
    if (!clientProfileId) throw new BadRequestException('Perfil de cliente não encontrado.');
    return this.requestsService.findMine(clientProfileId, query);
  }

  @Roles('PROFESSIONAL')
  @Get('available')
  async findAvailable(@CurrentUser() user: AuthenticatedUser, @Query() query: ListRequestsQueryDto) {
    const professional = await this.requestsService.resolveProfessionalProfile(user.userId);
    if (!professional) throw new BadRequestException('Perfil de profissional não encontrado.');
    if (professional.categoryIds.length === 0) {
      return { items: [], page: query.page, pageSize: query.pageSize, total: 0, isLocationUnlocked: false };
    }
    return this.requestsService.findAvailable(professional.categoryIds, professional.hasActiveAreaAccess, query);
  }

  @Get(':id')
  async findOne(@CurrentUser() user: AuthenticatedUser, @Param('id') id: string) {
    if (user.role === 'PROFESSIONAL') {
      const professional = await this.requestsService.resolveProfessionalProfile(user.userId);
      return this.requestsService.findOne(id, {
        role: 'PROFESSIONAL',
        hasActiveAreaAccess: professional?.hasActiveAreaAccess ?? false,
      });
    }

    const clientProfileId = await this.requestsService.resolveClientProfileId(user.userId);
    return this.requestsService.findOne(id, { role: 'CLIENT', clientProfileId });
  }
}
