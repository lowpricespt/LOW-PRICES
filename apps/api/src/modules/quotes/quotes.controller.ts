import { BadRequestException, Body, Controller, Get, Param, Post } from '@nestjs/common';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { AuthenticatedUser } from '../auth/interfaces/authenticated-user.interface';
import { QuotesService } from './quotes.service';
import { CreateQuoteDto } from './dto/create-quote.dto';
import { RequestsService } from '../requests/requests.service';

@Controller()
export class QuotesController {
  constructor(
    private readonly quotesService: QuotesService,
    private readonly requestsService: RequestsService,
  ) {}

  @Roles('PROFESSIONAL')
  @Post('quotes')
  async create(@CurrentUser() user: AuthenticatedUser, @Body() dto: CreateQuoteDto) {
    const professional = await this.requestsService.resolveProfessionalProfile(user.userId);
    if (!professional) throw new BadRequestException('Perfil de profissional não encontrado.');
    return this.quotesService.create(professional.id, dto);
  }

  @Get('requests/:requestId/quotes')
  findByRequest(@Param('requestId') requestId: string) {
    // "Propostas recebidas" do cliente e "os meus orçamentos enviados" do
    // profissional usam o mesmo endpoint — a lista é sempre por pedido.
    return this.quotesService.findByServiceRequest(requestId);
  }

  @Roles('CLIENT')
  @Post('quotes/:id/accept')
  async accept(@CurrentUser() user: AuthenticatedUser, @Param('id') id: string) {
    const clientProfileId = await this.requestsService.resolveClientProfileId(user.userId);
    if (!clientProfileId) throw new BadRequestException('Perfil de cliente não encontrado.');
    return this.quotesService.accept(id, clientProfileId);
  }

  @Roles('CLIENT')
  @Post('quotes/:id/reject')
  async reject(@CurrentUser() user: AuthenticatedUser, @Param('id') id: string) {
    const clientProfileId = await this.requestsService.resolveClientProfileId(user.userId);
    if (!clientProfileId) throw new BadRequestException('Perfil de cliente não encontrado.');
    return this.quotesService.reject(id, clientProfileId);
  }
}
