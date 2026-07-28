# Low Prices — Arquitetura Financeira (Fase 13, ainda não implementada)

Nenhum pagamento real acontece ainda. Esta é a arquitetura para quando for ativada — ver também `docs/business/BUSINESS_MODEL.md`, secção 4, que já antecipa este desenho.

## 1. Gateway único: Stripe

Stripe é o único integrador direto. MB Way, Multibanco, Apple Pay e Google Pay são **métodos de pagamento dentro do Stripe** (via Stripe Payment Element/Payment Intents), não integrações separadas — evita 4 integrações a manter.

```typescript
// apps/api/src/modules/payments/payments.service.ts (a criar na Fase 13)

interface PaymentService {
  createPaymentIntent(params: { amount: number; currency: 'EUR'; type: PaymentType; metadata: Record<string, string> }): Promise<{ clientSecret: string }>;
  confirmPayout(professionalStripeAccountId: string, amount: number): Promise<void>; // Stripe Connect
  handleWebhook(payload: Buffer, signature: string): Promise<void>;
}
```

## 2. `Payment` por `type`, não uma tabela por modelo de negócio

```prisma
enum PaymentType {
  COMMISSION          // corte da plataforma sobre um Job concluído (modelo do MVP)
  SUBSCRIPTION         // mensalidade de plano Premium/Pro
  CREDIT_PURCHASE       // compra de créditos/moedas
  FEATURED_LISTING       // destaque de perfil
  SPONSORED_PROMOTION     // promoção patrocinada
}

model Payment {
  id            String       @id @default(uuid())
  type          PaymentType
  userId        String
  jobId         String?      // preenchido só quando type = COMMISSION
  amount        Decimal      @db.Decimal(10, 2)
  currency      String       @default("EUR")
  status        String       // "PENDING" | "SUCCEEDED" | "FAILED" | "REFUNDED"
  stripePaymentIntentId String? @unique
  createdAt     DateTime     @default(now())
}
```

Ativar um novo modelo de monetização (ex.: créditos) é adicionar um valor ao enum `PaymentType` e o respetivo fluxo de criação de `PaymentIntent` — nunca uma migração nova de tabela.

## 3. Stripe Connect (payouts a profissionais)

Modelo **Standard** ou **Express** do Stripe Connect (a decidir com base na experiência de onboarding pretendida — Express é mais rápido para o profissional, Standard dá mais controlo à Low Prices sobre disputas). O `ProfessionalProfile` ganha um campo `stripeAccountId` (a adicionar só nesta fase) quando o profissional completa o onboarding do Connect.

## 4. Wallet interna / Créditos

Não é uma conta bancária real — é um saldo (`ProfessionalProfile` ou uma tabela `WalletTransaction` dedicada, a decidir consoante a complexidade necessária) que se debita ao usar funcionalidades pagas (ex.: destacar um perfil) sem passar pelo Stripe a cada ação — só quando o saldo é carregado (`CREDIT_PURCHASE`) é que há uma transação Stripe real.

## 5. Faturação

Delegada ao Stripe Tax/Invoicing quando ativado — não construir um motor de faturas próprio; é uma das áreas onde reinventar tem custo de compliance desproporcional ao valor para o MVP.

## 6. Segurança

- Webhooks do Stripe sempre verificados por assinatura (`stripe.webhooks.constructEvent`) — nunca confiar no payload sem verificação.
- Nenhum dado de cartão toca o backend da Low Prices (Stripe Elements/Payment Element tokenizam no cliente) — reduz drasticamente o âmbito de conformidade PCI-DSS.
