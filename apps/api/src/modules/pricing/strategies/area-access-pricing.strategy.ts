import { Injectable } from '@nestjs/common';
import type { MonetizedAction, PricingQuote, PricingStrategy } from '../interfaces/pricing-strategy.interface';

// Valores de arranque — ajustáveis sem tocar em código chamador, já que
// tudo passa sempre pelo PricingService (nunca um valor fixo espalhado
// pela app). Ver BUSINESS_MODEL.md para a justificação dos dois planos.
const MONTHLY_PRICE_CENTS = 10_000; // 100,00€
const WEEKLY_PRICE_CENTS = 3_000; // 30,00€

@Injectable()
export class AreaAccessPricingStrategy implements PricingStrategy {
  readonly type = 'AREA_ACCESS';

  async quote(action: MonetizedAction, _context: Record<string, unknown>): Promise<PricingQuote> {
    if (action === 'AREA_ACCESS_MONTHLY' || action === 'SUBSCRIBE_PREMIUM') {
      return {
        action,
        amount: MONTHLY_PRICE_CENTS,
        currency: 'EUR',
        description: 'Acesso a pedidos da tua área e arredores — plano mensal',
      };
    }

    if (action === 'AREA_ACCESS_WEEKLY') {
      return {
        action,
        amount: WEEKLY_PRICE_CENTS,
        currency: 'EUR',
        description: 'Acesso a pedidos da tua área e arredores — plano semanal',
      };
    }

    throw new Error(
      `AreaAccessPricingStrategy só sabe cobrar AREA_ACCESS_MONTHLY/WEEKLY (ou SUBSCRIBE_PREMIUM). Ação recebida: ${action}.`,
    );
  }
}
