# Low Prices — Modelo de Negócio

**Objetivo:** encontrar um modelo de monetização sustentável, escalável e justo para clientes e profissionais, e recomendar o que implementar primeiro no MVP.

---

## 1. Modelos analisados

### 1.1 Comissão por serviço concluído
O profissional paga uma percentagem (ex.: 10-20%) do valor do trabalho quando este é concluído e pago através da plataforma.

**Vantagens:**
- Alinha os incentivos: a Low Prices só ganha quando o profissional ganha. Fácil de justificar.
- Escala naturalmente com o volume — não exige venda ativa.
- Modelo já validado por Uber, TaskRabbit, Fiverr.

**Desvantagens:**
- Exige processar pagamentos pela plataforma (Stripe Connect) — mais complexidade técnica e regulatória desde o dia 1.
- Profissionais podem tentar "contornar" a plataforma depois do primeiro contacto (combinar pagamento fora da app).
- Receita zero enquanto não há transações — arranque mais lento.

### 1.2 Subscrição mensal (profissionais)
O profissional paga uma mensalidade fixa para poder responder a pedidos.

**Vantagens:**
- Receita previsível e recorrente (MRR), mais fácil de planear e levantar investimento.
- Simples de implementar tecnicamente (sem gestão de pagamento por transação).

**Desvantagens:**
- Barreira de entrada para profissionais novos ou com pouco volume — podem desistir antes de rentabilizar a mensalidade.
- Não alinha o incentivo com o sucesso do profissional (a Low Prices ganha mesmo que ele não feche nenhum trabalho).

### 1.3 Compra de créditos / sistema de moedas
O profissional compra créditos e gasta-os para desbloquear o contacto de um pedido ou para enviar um orçamento.

**Vantagens:**
- Bom para monetizar profissionais com volume irregular (só gastam quando querem).
- Cria uma sensação de "jogo"/gamificação que pode aumentar o engagement.

**Desvantagens:**
- Modelo pouco transparente — pode ser percecionado como "pay to play", prejudicando a confiança logo no arranque.
- Complexidade extra de UX (explicar créditos, preços, packs) que contraria o objetivo de simplicidade da Low Prices.

### 1.4 Destaque de profissionais / Boosts / Prioridade nas pesquisas
O profissional paga para aparecer em posições de destaque nos resultados.

**Vantagens:**
- Receita adicional sem afetar a experiência do cliente (o profissional em destaque continua a ser um profissional real e verificado).
- Fácil de testar em paralelo com outro modelo principal.

**Desvantagens:**
- Só funciona quando já há volume suficiente de profissionais a competir pelas mesmas pesquisas — inútil no arranque.
- Risco de os clientes perceberem "quem paga aparece primeiro" como menos justo, se mal comunicado.

### 1.5 Anúncios patrocinados (terceiros)
Publicidade de marcas relacionadas (lojas de material, seguros, etc.).

**Vantagens:**
- Não pesa sobre clientes nem profissionais diretamente.

**Desvantagens:**
- Exige uma base de utilizadores grande para ser relevante — não faz sentido no MVP.
- Risco de poluir a experiência (contraria "muito espaço em branco, muito minimalismo" da identidade da marca).

### 1.6 Planos Premium / Pro para profissionais
Nível pago com benefícios extra: mais categorias, estatísticas avançadas, resposta prioritária, selo de confiança.

**Vantagens:**
- Combina bem com a subscrição, mas com um plano gratuito que reduz a barreira de entrada.
- Permite segmentar profissionais "a sério" dos ocasionais.

**Desvantagens:**
- Exige ter funcionalidades suficientemente valiosas para justificar o upgrade — difícil de ter pronto logo no MVP.

### 1.7 Geração de leads (venda de contactos)
A Low Prices vende o contacto do cliente a vários profissionais, sem garantir exclusividade.

**Vantagens:**
- Modelo comum no setor (ex.: Thumbtack em fases iniciais).

**Desvantagens:**
- Pior experiência para o cliente (recebe muitos contactos não solicitados).
- Vai contra o objetivo explícito da Low Prices de ser "superior em simplicidade" às plataformas existentes.

---

## 2. Comparação resumida

| Modelo | Receita previsível | Barreira de entrada | Alinhamento de incentivos | Complexidade técnica | Adequado ao MVP |
|---|---|---|---|---|---|
| Comissão por serviço | Média | Baixa | Alta | Alta (Stripe Connect) | ✅ |
| Subscrição mensal | Alta | Alta | Baixa | Baixa | ⚠️ (fase 2) |
| Créditos/moedas | Baixa | Média | Média | Média | ❌ |
| Destaque/Boosts | Baixa | Baixa | Média | Baixa | ⚠️ (complemento) |
| Anúncios | Baixa | Baixa | N/A | Média | ❌ (sem escala ainda) |
| Planos Premium | Alta | Média | Média | Média | ⚠️ (fase 2) |
| Geração de leads | Média | Baixa | Baixa | Baixa | ❌ (má UX) |

---

## 3. Recomendação para o MVP

**Modelo principal: comissão por serviço concluído.**

Razões:
1. **Alinha os incentivos** — a Low Prices só ganha quando o profissional ganha, o que é o argumento de venda mais forte para atrair os primeiros profissionais (baixo risco para eles).
2. **Zero barreira de entrada** — qualquer profissional pode começar a usar sem pagar nada adiantado, o que maximiza a adoção nos primeiros 60 dias (o próprio prazo definido para o MVP).
3. **É o único modelo, dos analisados, cuja implementação técnica (Stripe Connect) já estava prevista desde a fundação técnica** — não é trabalho extra.

**Complemento tático, não estrutural:** destaque/boost pago pode ser adicionado como funcionalidade opcional assim que houver profissionais suficientes a competir pela mesma categoria/zona (provavelmente 3-6 meses após o lançamento) — não implementar no MVP, mas manter a arquitetura de perfis preparada para isso (campo `isFeatured`/`featuredUntil` no `ProfessionalProfile`, já fácil de adicionar sem migração disruptiva).

**Não recomendado para o MVP:** subscrição, créditos, anúncios e geração de leads — todos ou aumentam a barreira de entrada logo no arranque, ou pioram a experiência do cliente, ou exigem escala que ainda não existe.

**Reavaliar aos 6 meses:** se a taxa de conversão de pedido → trabalho pago for baixa (sinal de que a comissão por si só não sustenta o negócio), introduzir um plano Premium opcional para profissionais com volume alto, como camada adicional — nunca como substituto da comissão.

---

## 4. Arquitetura técnica preparada para mudar de modelo sem reescrever o sistema

Nenhum dos modelos analisados foi implementado ainda (por decisão — só a comissão entra no MVP). Para que adicionar ou trocar de modelo no futuro não exija reescrever pagamentos/perfis, o desenho já assume desde já:

- **`ProfessionalProfile` como dono de todos os atributos de monetização**, cada um opcional e independente: `isFeatured`/`featuredUntil` (destaque), `subscriptionTier` (Premium/Pro — enum nulo por defeito), `creditBalance` (créditos/moedas). Nenhum destes campos existe ainda no schema Prisma — são adicionados só quando o modelo correspondente for ativado, sem migração disruptiva (são todos colunas opcionais).
- **`Payment` (a criar na Fase 12) desenhado por `type`** (`COMMISSION` | `SUBSCRIPTION` | `CREDIT_PURCHASE` | `FEATURED_LISTING` | `SPONSORED_PROMOTION`), não uma tabela por modelo — permite ativar um novo `type` sem nova tabela nem nova migração de schema, só um novo valor de enum e o respetivo fluxo Stripe.
- **O motor de pricing fica isolado num único serviço** (`PricingService`, a criar na Fase 12), que decide o custo de uma ação (publicar pedido, destacar perfil, etc.) consultando a configuração ativa — nunca hardcoded nos controllers. Trocar de modelo passa a ser mudar a configuração deste serviço, não o código à sua volta.
- **Nada disto bloqueia o MVP**: só a comissão (secção 3) precisa de existir para o lançamento; o resto fica documentado aqui para quando fizer sentido, sem comprometer a data dos 60 dias.
