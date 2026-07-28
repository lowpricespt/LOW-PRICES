import { BadRequestException, Body, Controller, Get, Param, Patch } from '@nestjs/common';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import type { AuthenticatedUser } from '../auth/interfaces/authenticated-user.interface';
import { RequestsService } from '../requests/requests.service';
import { JobsService } from './jobs.service';
import { CancelJobDto } from './dto/cancel-job.dto';

@Controller('jobs')
export class JobsController {
  constructor(
    private readonly jobsService: JobsService,
    private readonly requestsService: RequestsService,
  ) {}

  @Get('me')
  async findMine(@CurrentUser() user: AuthenticatedUser) {
    if (user.role === 'CLIENT') {
      const clientProfileId = await this.requestsService.resolveClientProfileId(user.userId);
      if (!clientProfileId) throw new BadRequestException('Perfil de cliente não encontrado.');
      return this.jobsService.findMineAsClient(clientProfileId);
    }

    const professional = await this.requestsService.resolveProfessionalProfile(user.userId);
    if (!professional) throw new BadRequestException('Perfil de profissional não encontrado.');
    return this.jobsService.findMineAsProfessional(professional.id);
  }

  @Roles('PROFESSIONAL')
  @Get('me/earnings')
  async earnings(@CurrentUser() user: AuthenticatedUser) {
    const professional = await this.requestsService.resolveProfessionalProfile(user.userId);
    if (!professional) throw new BadRequestException('Perfil de profissional não encontrado.');
    return this.jobsService.getEarningsSummary(professional.id);
  }

  @Get(':id')
  async findOne(@CurrentUser() user: AuthenticatedUser, @Param('id') id: string) {
    if (user.role === 'CLIENT') {
      const clientProfileId = await this.requestsService.resolveClientProfileId(user.userId);
      return this.jobsService.findOne(id, { clientProfileId });
    }

    const professional = await this.requestsService.resolveProfessionalProfile(user.userId);
    return this.jobsService.findOne(id, { professionalProfileId: professional?.id });
  }

  @Roles('PROFESSIONAL')
  @Patch(':id/start')
  async start(@CurrentUser() user: AuthenticatedUser, @Param('id') id: string) {
    const professional = await this.requestsService.resolveProfessionalProfile(user.userId);
    if (!professional) throw new BadRequestException('Perfil de profissional não encontrado.');
    return this.jobsService.start(id, professional.id);
  }

  @Roles('PROFESSIONAL')
  @Patch(':id/complete')
  async complete(@CurrentUser() user: AuthenticatedUser, @Param('id') id: string) {
    const professional = await this.requestsService.resolveProfessionalProfile(user.userId);
    if (!professional) throw new BadRequestException('Perfil de profissional não encontrado.');
    return this.jobsService.complete(id, professional.id);
  }

  @Patch(':id/cancel')
  async cancel(@CurrentUser() user: AuthenticatedUser, @Param('id') id: string, @Body() dto: CancelJobDto) {
    if (user.role === 'CLIENT') {
      const clientProfileId = await this.requestsService.resolveClientProfileId(user.userId);
      return this.jobsService.cancel(id, { clientProfileId }, dto);
    }

    const professional = await this.requestsService.resolveProfessionalProfile(user.userId);
    return this.jobsService.cancel(id, { professionalProfileId: professional?.id }, dto);
  }
}
