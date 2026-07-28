import { Injectable } from '@nestjs/common';
import type { MonetizedAction, PricingQuote, PricingStrategy } from '../interfaces/pricing-strategy.interface';

/**
 * Estratégias documentadas em BUSINESS_MODEL.md mas NÃO ativas no MVP.
 * Ficam aqui, prontas a registar no PricingModule assim que fizer
 * sentido ativá-las — não é preciso escrever nada de novo, só trocar
 * (ou combinar) o provider em pricing.module.ts.
 */

@Injectable()
export class SubscriptionPricingStrategy implements PricingStrategy {
  readonly type = 'SUBSCRIPTION';

  async quote(_action: MonetizedAction, _context: Record<string, unknown>): Promise<PricingQuote> {
    throw new Error('Plano Premium (subscrição) ainda não está ativo — ver BUSINESS_MODEL.md, secção 3.');
  }
}

@Injectable()
export class CreditsPricingStrategy implements PricingStrategy {
  readonly type = 'CREDITS';

  async quote(_action: MonetizedAction, _context: Record<string, unknown>): Promise<PricingQuote> {
    throw new Error('Sistema de créditos ainda não está ativo — ver BUSINESS_MODEL.md, secção 3.');
  }
}

@Injectable()
export class FeaturedListingPricingStrategy implements PricingStrategy {
  readonly type = 'FEATURED_LISTING';

  async quote(_action: MonetizedAction, _context: Record<string, unknown>): Promise<PricingQuote> {
    throw new Error('Destaque de perfil ainda não está ativo — ver BUSINESS_MODEL.md, secção 3.');
  }
}

@Injectable()
export class BoostListingPricingStrategy implements PricingStrategy {
  readonly type = 'BOOST_LISTING';

  async quote(_action: MonetizedAction, _context: Record<string, unknown>): Promise<PricingQuote> {
    throw new Error('Boost de anúncios ainda não está ativo — ver BUSINESS_MODEL.md, secção 3.');
  }
}

@Injectable()
export class VirtualCurrencyPricingStrategy implements PricingStrategy {
  readonly type = 'VIRTUAL_CURRENCY';

  async quote(_action: MonetizedAction, _context: Record<string, unknown>): Promise<PricingQuote> {
    throw new Error('Moeda virtual ainda não está ativa — ver BUSINESS_MODEL.md, secção 3.');
  }
}
