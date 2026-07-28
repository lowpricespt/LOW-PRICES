import { Module } from '@nestjs/common';
import { ACTIVE_PRICING_STRATEGIES } from './pricing.constants';
import { PricingController } from './pricing.controller';
import { PricingService } from './pricing.service';
import { CommissionPricingStrategy } from './strategies/commission-pricing.strategy';
import { AreaAccessPricingStrategy } from './strategies/area-access-pricing.strategy';

@Module({
  controllers: [PricingController],
  providers: [
    CommissionPricingStrategy,
    AreaAccessPricingStrategy,
    {
      // Estratégias ATIVAS no MVP (ver docs/business/BUSINESS_MODEL.md):
      // comissão por trabalho concluído + planos de acesso à área do
      // Especialista (100€/mês ou 30€/semana). Ativar mais tarde outro
      // modelo (créditos, destaque, boost) é só adicionar a estratégia
      // real (substituindo o stub em future-strategies.stub.ts) a esta
      // lista — nunca é preciso tocar em quem consome PricingService.
      provide: ACTIVE_PRICING_STRATEGIES,
      useFactory: (commission: CommissionPricingStrategy, areaAccess: AreaAccessPricingStrategy) => [
        commission,
        areaAccess,
      ],
      inject: [CommissionPricingStrategy, AreaAccessPricingStrategy],
    },
    PricingService,
  ],
  exports: [PricingService],
})
export class PricingModule {}
