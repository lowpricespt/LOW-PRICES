import { BadRequestException, Body, Controller, Get, Post } from '@nestjs/common';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { AuthenticatedUser } from '../auth/interfaces/authenticated-user.interface';
import { RequestsService } from '../requests/requests.service';
import { DocumentsService } from './documents.service';
import { UpsertDocumentDto } from './dto/upsert-document.dto';

@Roles('PROFESSIONAL')
@Controller('documents')
export class DocumentsController {
  constructor(
    private readonly documentsService: DocumentsService,
    private readonly requestsService: RequestsService,
  ) {}

  private async resolveProfessionalId(userId: string): Promise<string> {
    const profile = await this.requestsService.resolveProfessionalProfile(userId);
    if (!profile) throw new BadRequestException('Perfil de profissional não encontrado.');
    return profile.id;
  }

  @Get('me')
  async findMine(@CurrentUser() user: AuthenticatedUser) {
    const professionalProfileId = await this.resolveProfessionalId(user.userId);
    return this.documentsService.findMine(professionalProfileId);
  }

  @Post()
  async upsert(@CurrentUser() user: AuthenticatedUser, @Body() dto: UpsertDocumentDto) {
    const professionalProfileId = await this.resolveProfessionalId(user.userId);
    return this.documentsService.upsert(professionalProfileId, dto);
  }
}
