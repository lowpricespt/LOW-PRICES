import { BadRequestException, Body, Controller, Get, Param, Post } from '@nestjs/common';
import { Public } from '../../common/decorators/public.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { AuthenticatedUser } from '../auth/interfaces/authenticated-user.interface';
import { RequestsService } from '../requests/requests.service';
import { ReviewsService } from './reviews.service';
import { CreateReviewDto } from './dto/create-review.dto';

@Controller()
export class ReviewsController {
  constructor(
    private readonly reviewsService: ReviewsService,
    private readonly requestsService: RequestsService,
  ) {}

  @Roles('CLIENT')
  @Post('reviews')
  async create(@CurrentUser() user: AuthenticatedUser, @Body() dto: CreateReviewDto) {
    const clientProfileId = await this.requestsService.resolveClientProfileId(user.userId);
    if (!clientProfileId) throw new BadRequestException('Perfil de cliente não encontrado.');
    return this.reviewsService.create(clientProfileId, dto);
  }

  // Pública: usada tanto pela futura página pública de perfil do
  // Especialista como pela sua própria dashboard de "Avaliações".
  @Public()
  @Get('professionals/:id/reviews')
  async findForProfessional(@Param('id') professionalProfileId: string) {
    return this.reviewsService.findForProfessional(professionalProfileId);
  }

  @Roles('PROFESSIONAL')
  @Get('reviews/me')
  async findMine(@CurrentUser() user: AuthenticatedUser) {
    const professional = await this.requestsService.resolveProfessionalProfile(user.userId);
    if (!professional) throw new BadRequestException('Perfil de profissional não encontrado.');
    return this.reviewsService.findForProfessional(professional.id);
  }
}
