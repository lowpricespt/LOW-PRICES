import { Injectable } from '@nestjs/common';
import type { MonetizedAction, PricingQuote, PricingStrategy } from '../interfaces/pricing-strategy.interface';

const COMMISSION_RATE = 0.15; // 15% — valor de arranque, ajustável sem tocar em código

@Injectable()
export class CommissionPricingStrategy implements PricingStrategy {
  readonly type = 'COMMISSION';

  async quote(action: MonetizedAction, context: Record<string, unknown>): Promise<PricingQuote> {
    if (action !== 'JOB_COMPLETED') {
      throw new Error(
        `CommissionPricingStrategy só sabe cobrar por JOB_COMPLETED. Ação recebida: ${action}. ` +
          'Isto é intencional: no MVP só a comissão está ativa (ver BUSINESS_MODEL.md).',
      );
    }

    const jobValueCents = Number(context.jobValueCents ?? 0);
    return {
      action,
      amount: Math.round(jobValueCents * COMMISSION_RATE),
      currency: 'EUR',
      description: `Comissão de ${COMMISSION_RATE * 100}% sobre o valor do trabalho`,
    };
  }
}
