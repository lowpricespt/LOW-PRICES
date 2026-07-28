import { BadRequestException, Controller, Get, Post, Body } from '@nestjs/common';
import { IsIn } from 'class-validator';
import { Roles } from '../../common/decorators/roles.decorator';
import { Public } from '../../common/decorators/public.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { AuthenticatedUser } from '../auth/interfaces/authenticated-user.interface';
import { PrismaService } from '../../infra/prisma/prisma.service';
import { PricingService } from './pricing.service';

class ActivateAreaAccessDto {
  @IsIn(['monthly', 'weekly'])
  plan!: 'monthly' | 'weekly';
}

@Controller('pricing')
export class PricingController {
  constructor(
    private readonly pricingService: PricingService,
    private readonly prisma: PrismaService,
  ) {}

  @Public()
  @Get('area-access')
  async getAreaAccessPlans() {
    const [monthly, weekly] = await Promise.all([
      this.pricingService.quote('AREA_ACCESS_MONTHLY'),
      this.pricingService.quote('AREA_ACCESS_WEEKLY'),
    ]);
    return { monthly, weekly };
  }

  /**
   * SIMULAÇÃO — ativa o acesso à área sem cobrar nada. Existe para o
   * bloqueio de informação (ver ServiceRequestResponseDto) ser
   * testável de ponta a ponta antes do Stripe estar ligado (Fase 13).
   * Quando o Stripe existir, este endpoint é substituído pelo webhook
   * `checkout.session.completed`, que faz exatamente a mesma escrita
   * (`hasAreaAccess`/`areaAccessExpiresAt`) — nada no resto do sistema
   * muda, porque tudo já lê só esses dois campos.
   */
  @Roles('PROFESSIONAL')
  @Post('area-access/activate-simulated')
  async activateSimulated(@CurrentUser() user: AuthenticatedUser, @Body() dto: ActivateAreaAccessDto) {
    const profile = await this.prisma.professionalProfile.findUnique({ where: { userId: user.userId } });
    if (!profile) throw new BadRequestException('Perfil de profissional não encontrado.');

    const durationDays = dto.plan === 'monthly' ? 30 : 7;
    const areaAccessExpiresAt = new Date(Date.now() + durationDays * 24 * 60 * 60 * 1000);

    await this.prisma.professionalProfile.update({
      where: { id: profile.id },
      data: { hasAreaAccess: true, areaAccessExpiresAt, subscriptionTier: dto.plan.toUpperCase() },
    });

    return { hasAreaAccess: true, areaAccessExpiresAt };
  }
}
