import { BadRequestException, Controller, Get, Param } from '@nestjs/common';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { AuthenticatedUser } from '../auth/interfaces/authenticated-user.interface';
import { RequestsService } from '../requests/requests.service';
import { JobsService } from './jobs.service';

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

  @Get(':id')
  async findOne(@CurrentUser() user: AuthenticatedUser, @Param('id') id: string) {
    if (user.role === 'CLIENT') {
      const clientProfileId = await this.requestsService.resolveClientProfileId(user.userId);
      return this.jobsService.findOne(id, { clientProfileId });
    }

    const professional = await this.requestsService.resolveProfessionalProfile(user.userId);
    return this.jobsService.findOne(id, { professionalProfileId: professional?.id });
  }
}
