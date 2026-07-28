import { Inject, Injectable } from '@nestjs/common';
import type { MonetizedAction, PricingQuote, PricingStrategy } from './interfaces/pricing-strategy.interface';
import { ACTIVE_PRICING_STRATEGIES } from './pricing.constants';

/**
 * Ponto único de acesso ao pricing. Nenhum outro módulo deve importar
 * uma estratégia diretamente. Roteia cada ação para a primeira
 * estratégia ativa que a souber tratar — permite ter várias estratégias
 * ativas ao mesmo tempo (ex.: Comissão + Acesso à Área), cada uma
 * responsável só pelas suas próprias ações.
 */
@Injectable()
export class PricingService {
  constructor(@Inject(ACTIVE_PRICING_STRATEGIES) private readonly strategies: PricingStrategy[]) {}

  async quote(action: MonetizedAction, context: Record<string, unknown> = {}): Promise<PricingQuote> {
    let lastError: unknown;
    for (const strategy of this.strategies) {
      try {
        return await strategy.quote(action, context);
      } catch (error) {
        lastError = error;
      }
    }
    throw lastError ?? new Error(`Nenhuma estratégia de pricing ativa sabe tratar a ação "${action}".`);
  }
}
