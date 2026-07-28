export type MonetizedAction =
  | 'JOB_COMPLETED' // comissão sobre um trabalho concluído
  | 'AREA_ACCESS_MONTHLY' // acesso a pedidos da área do profissional — plano mensal
  | 'AREA_ACCESS_WEEKLY' // acesso a pedidos da área do profissional — plano semanal
  | 'FEATURE_PROFILE' // destaque de perfil (dias)
  | 'BOOST_LISTING' // impulsionar um pedido/anúncio específico por um período
  | 'PURCHASE_CREDITS' // compra de créditos
  | 'PURCHASE_VIRTUAL_CURRENCY' // moeda virtual própria da plataforma (distinta de créditos genéricos — ver BUSINESS_MODEL.md)
  | 'SUBSCRIBE_PREMIUM'; // subscrição mensal (sinónimo genérico de AREA_ACCESS_MONTHLY, mantido por compatibilidade)

export interface PricingQuote {
  action: MonetizedAction;
  amount: number; // em cêntimos, nunca float de euros (evita erros de arredondamento)
  currency: 'EUR';
  description: string;
}

/**
 * Qualquer modelo de monetização (comissão, subscrição, créditos,
 * destaque, promoção, leads) implementa este contrato. O
 * `RequestsService`/`JobsService` (quando existir) nunca calculam preço
 * diretamente — perguntam sempre ao `PricingService` ativo. Trocar de
 * modelo de negócio é trocar a implementação injetada em
 * `pricing.module.ts`, nunca alterar os módulos que a consomem.
 */
export interface PricingStrategy {
  readonly type: string;
  quote(action: MonetizedAction, context: Record<string, unknown>): Promise<PricingQuote>;
}
