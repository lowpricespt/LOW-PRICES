# Low Prices — Relatório de Estado e Plano de Lançamento

**Data:** 30 de julho de 2026
**Âmbito:** ponto da situação completo (site + app + API), o que falta para ir ao ar, custos estimados, recomendações e sugestões de plataformas/software.

> Este documento não substitui aconselhamento jurídico, fiscal ou financeiro — as secções de custos e obrigações legais são estimativas de engenharia, não garantias. Antes de cobrar dinheiro real a alguém, confirma os valores fiscais com um contabilista e o texto legal com um advogado (ver secção 5).

---

## Resumo executivo

As funcionalidades base do produto — tudo o que um cliente ou profissional faz no dia a dia — estão construídas e testadas ao vivo, no site e na app, com dados reais numa base de dados de teste: registo (email/password e Google), pedir um serviço, receber e enviar orçamentos, aceitar, conversar, agendar, concluir, avaliar, gerir perfil/localização/disponibilidade, ver ganhos, ativar o plano Premium e alterar dados de conta.

**O que falta para ir ao ar não é código do produto — é infraestrutura, credenciais e formalidades:**

1. **Pagamentos reais** (Stripe) — hoje não existe cobrança nenhuma; o plano Premium ativa-se de graça ("modo piloto") e os "Ganhos" mostram apenas o valor combinado no orçamento, nunca dinheiro que passou pela plataforma.
2. **Credenciais Google reais** (OAuth) — o código do login com Google está pronto e testado (site e app), mas precisa de um projeto Google Cloud com Client ID/Secret verdadeiros.
3. **Contas de loja** (Apple Developer, Google Play Console) — necessárias para publicar a app.
4. **Domínio próprio + email profissional.**
5. **Revisão legal** dos Termos/Privacidade (já existem como modelo, com os pontos exigidos por lei sinalizados, mas por preencher e por rever) e abertura de atividade nas Finanças antes de cobrar a quem quer que seja.
6. **Notificações push** — ainda não implementadas (só email).

Nada disto é trabalho de "corrigir bugs" — é decidir e configurar. A secção 2 lista tudo por ordem de bloqueio, a secção 3 estima custos, a secção 4 dá uma sequência recomendada.

---

## Índice

1. [O que já funciona — fluxo completo testado](#1-o-que-já-funciona--fluxo-completo-testado)
2. [O que falta para ir ao ar](#2-o-que-falta-para-ir-ao-ar)
3. [Custos estimados](#3-custos-estimados)
4. [Recomendações — sequência sugerida](#4-recomendações--sequência-sugerida)
5. [Plataformas e software sugeridos](#5-plataformas-e-software-sugeridos)

---

## 1. O que já funciona — fluxo completo testado

Testado ao vivo nesta sessão (e nas anteriores), com contas reais numa base de dados local isolada — nunca em produção.

### 1.1 Cliente (site + app)

| Funcionalidade | Site | App | Notas |
|---|---|---|---|
| Registo (email/password) | ✅ | ✅ | |
| Registo/login com Google | ✅ (código pronto, falta credencial real) | ✅ (código pronto, falta credencial real) | Ver secção 2.2 |
| Login, logout, sessão persistente | ✅ | ✅ | Cookie `httpOnly` (site) / `flutter_secure_storage` (app), refresh automático |
| Pedir um serviço (assistente completo) | ✅ | ✅ | Categoria, descrição, fotos, localização, urgência, orçamento |
| Ver pedidos e o respetivo estado | ✅ | ✅ | |
| Receber e responder a orçamentos (aceitar/rejeitar) | ✅ | ✅ | Aceitar cria automaticamente o trabalho agendado |
| Conversar com o profissional | ✅ | ✅ | Antes e depois de aceitar o orçamento |
| Histórico + avaliar profissional | ✅ | App: falta lista dedicada | |
| Favoritos | ✅ | App: falta ecrã dedicado | |
| Moradas guardadas | ✅ | — | |
| Alterar password/email, eliminar conta | ✅ | ✅ | |

### 1.2 Profissional (site + app)

| Funcionalidade | Site | App | Notas |
|---|---|---|---|
| Registo (assistente completo: conta, categorias, raio, localização, foto, descrição, documentos, disponibilidade) | ✅ | ✅ | Corrigido nesta sessão — o site perdia raio/localização/descrição/disponibilidade a meio do assistente |
| Editar perfil depois de registado (bio, raio, localização, disponibilidade, categorias, foto) | ✅ | ✅ (construído nesta sessão) | |
| Ver pedidos disponíveis (filtrados por categoria) e enviar orçamento | ✅ | ✅ | |
| Trabalhos aceites (contacto do cliente, iniciar/concluir/cancelar) | ✅ | ✅ (construído nesta sessão) | |
| Agenda (vista semana/mês, bloqueios de indisponibilidade) | ✅ | App: placeholder | |
| Conversas | ✅ | ✅ (construído nesta sessão) | |
| Avaliações recebidas | ✅ | App: só a média, sem lista | |
| Ganhos | ✅ | ✅ (construído nesta sessão) | Valores brutos — nota explícita sobre Stripe não estar ligado |
| Plano Premium (ativação em modo piloto, grátis) | ✅ | ✅ (construído nesta sessão) | |
| Definições (password/email/eliminar conta) | ✅ | ✅ (construído nesta sessão) | |
| Estatísticas de desempenho | ⚠️ placeholder honesto ("em construção") | ⚠️ placeholder honesto | Não existe em lado nenhum ainda — genuinamente por construir |

### 1.3 Administração

Painel mínimo por decisão de arquitetura (ver `docs/business` e comentários no código): só verificação de contas de profissional (aprovar/rejeitar). Suficiente para um piloto de dezenas de contas; não é um painel de gestão completo.

### 1.4 O que corre por trás (infraestrutura já real, não simulada)

- Base de dados PostgreSQL via Prisma, com o esquema completo do MVP.
- Upload de fotos/documentos para Cloudflare R2, com URLs assinadas.
- Emails transacionais via Resend (novo pedido, orçamento recebido, aceite, cancelado, nova mensagem, verificação de conta) — falha de forma graciosa (fica só registado em log) se a chave não estiver configurada, nunca rebenta a aplicação.
- Segurança: rate limiting por IP, `helmet`, sessões JWT com refresh rotativo e deteção de reutilização, passwords com `argon2`, DTOs validados e sem campos extra aceites (`whitelist: true`).

---

## 2. O que falta para ir ao ar

Ordenado por **quão bloqueador** é — "Bloqueador" significa "não podes cobrar/publicar sem isto"; "Importante" significa "deverias ter antes de teres tráfego real"; "Opcional" significa "quando o volume justificar".

### 🔴 Bloqueadores

| Item | Estado atual | O que falta |
|---|---|---|
| **Pagamentos (Stripe)** | Não implementado. Arquitetura já desenhada (`docs/architecture/PAYMENTS_ARCHITECTURE.md`) — comissão sobre trabalho concluído é o modelo recomendado. | Criar conta Stripe (+ Stripe Connect para pagar profissionais), implementar o módulo `payments`, ligar ao fluxo de "Trabalho concluído". Sem isto, a Low Prices não recebe comissão nenhuma. |
| **Credenciais Google OAuth reais** | Código 100% pronto (site e app), testado com credenciais falsas — confirma-se que funciona assim que a credencial for real. | Criar projeto no Google Cloud Console, configurar ecrã de consentimento OAuth, gerar um Client ID tipo "Web application" (usado por site **e** app), configurar `GOOGLE_CLIENT_ID`/`GOOGLE_CLIENT_SECRET`/`GOOGLE_CALLBACK_URL` no Railway e `GOOGLE_SERVER_CLIENT_ID` no build da app. |
| **Contas de loja (Apple/Google)** | Nenhuma app publicada ainda. | Apple Developer Program (99 USD/ano) + Google Play Console (25 USD, único). Preparar ícones, screenshots, política de privacidade pública, e submeter a build para revisão. |
| **Domínio próprio** | O site usa o domínio da Vercel por omissão; a API usa o domínio do Railway. | Registar um domínio, apontar DNS, configurar `NEXT_PUBLIC_SITE_URL`/`CORS_ORIGIN` para o domínio final. |
| **Revisão legal + abertura de atividade** | Termos de Serviço e Política de Privacidade já existem como modelo, escritos a cobrir RGPD/Código Civil/Comércio Eletrónico — mas com campos por preencher (`[NIF]`, `[morada]`, etc.) e sem revisão de advogado. | Preencher os dados reais, mandar rever por um advogado, e abrir atividade como trabalhador independente nas Finanças **antes** de cobrar seja o que for a clientes ou profissionais (sem isto, qualquer cobrança é irregular perante a Autoridade Tributária). |

### 🟡 Importantes (não bloqueiam o lançamento, mas devem vir logo a seguir)

| Item | Estado atual | Recomendação |
|---|---|---|
| **Notificações push** | Não implementado — só email. Interface já preparada no código (`NotificationService`), só falta a implementação real. | Firebase Cloud Messaging (grátis) — ver checklist já escrito no próprio código (`notification_service.dart`). |
| **Monitorização de erros** | Nenhuma — se algo rebentar em produção, só se sabe se um utilizador se queixar. | Sentry (nível gratuito cobre um piloto). |
| **Testes automatizados** | Zero testes automatizados em todo o projeto (API, site ou app). Toda a validação desta sessão foi manual, ao vivo. | Prioridade: testes dos fluxos críticos (autenticação, criar/aceitar pedido, pagamento assim que existir) — não é preciso cobertura total. |
| **Integração contínua (CI)** | Não existe pipeline automático — build/lint corre manualmente. | GitHub Actions: lint + build em cada alteração, no mínimo. |
| **Chat em tempo real** | Funciona por *polling* (verifica novas mensagens a cada 5 segundos) — decisão deliberada para não depender de infraestrutura extra (WebSocket/Redis) antes de haver tráfego que a justifique. | Aceitável para o volume de um piloto; migrar para WebSocket só se o atraso de 5s se tornar um problema real reportado por utilizadores. |
| **Filtragem por distância real** | O raio de ação e a localização do profissional já são guardados (construído nesta sessão), mas a lista de "pedidos disponíveis" ainda só filtra por categoria — a distância não é usada para decidir quem vê o quê. Decisão documentada no código (`MatchingService`): calcular distância em memória não escala, e a migração PostGIS ainda não foi feita. | Aceitável até algumas centenas de profissionais. Reavaliar quando o volume crescer. |

### 🟢 Opcionais (quando o volume justificar)

- **Redis** — rate limiting hoje é por processo (não partilhado entre instâncias); só importa se a API correr em mais do que uma instância.
- **Painel de administração mais completo** — hoje só aprova/rejeita profissionais; gestão de denúncias, disputas e utilizadores fica para quando houver volume que o justifique.
- **PostGIS / filtragem geográfica real** — ver acima.
- **Estatísticas de desempenho para o profissional** — funcionalidade nova, não existe em lado nenhum ainda.
- **Multi-idioma, agendamento recorrente, chat de voz/vídeo** — fora do âmbito do MVP, documentados em `docs/architecture/00-FUNDACAO-TECNICA.md` como pós-lançamento.

---

## 3. Custos estimados

Valores aproximados, em euros, para o volume de um piloto (algumas dezenas a centenas de contas). Todos escalam com o uso — nenhum exige compromisso longo à partida.

### 3.1 Recorrentes (mensal)

| Serviço | Função | Estimativa/mês | Nota |
|---|---|---:|---|
| Vercel | Alojamento do site | 0 € | Nível gratuito chega para um piloto; Pro (~19 €/mês) só se precisares de mais largura de banda/equipa |
| Railway | API + PostgreSQL | 5–20 € | Cobrado por uso (CPU/memória/tráfego); cresce com o volume |
| Cloudflare R2 | Fotos/documentos | 1–5 € | ~0,015 US$/GB armazenado, saída de dados grátis |
| Resend | Email transacional | 0 € | Nível gratuito: 3000 emails/mês; 19 €/mês a partir daí |
| Google Maps Platform | Autocomplete de morada | 0 € | Crédito gratuito mensal (200 US$) cobre largamente o volume de um piloto — vigiar consumo |
| Sentry | Monitorização de erros | 0 € | Nível gratuito chega para começar |
| Domínio | `.pt` ou `.com` | ~1 € | ~10–15 €/ano |
| Contabilista | Obrigatório assim que houver faturação real | 40–80 € | Varia por região/volume de faturas |
| **Total recorrente estimado** | | **~50–110 €/mês** | Sem contar comissões de pagamento (secção 3.3) |

### 3.2 Únicos (one-off)

| Item | Custo | Nota |
|---|---:|---|
| Apple Developer Program | ~92 € (99 US$) | Anual, não único — mas obrigatório e recorrente uma vez por ano |
| Google Play Console | ~23 € (25 US$) | Pagamento único, para sempre |
| Revisão legal (Termos/Privacidade) | 300–800 € | Estimativa — varia muito por advogado/escritório |

### 3.3 Por transação (quando o Stripe for ativado)

| Item | Custo típico |
|---|---|
| Stripe — cartão europeu | ~1,5% + 0,25 € por cobrança |
| Stripe Connect — payout ao profissional | ~0,25%–2% + 0,25 €, consoante o modelo (Standard/Express) |

Isto significa que o custo fixo mensal para manter a plataforma no ar, antes de teres qualquer transação paga, ronda **50–110 €/mês** — e mesmo isso pode ficar mais perto do limite inferior enquanto o volume for baixo, porque quase tudo tem nível gratuito.

---

## 4. Recomendações — sequência sugerida

Não é preciso fazer tudo de uma vez. Ordem sugerida, cada passo desbloqueando o seguinte:

1. **Domínio + DNS** — barato, rápido, e tudo o resto (emails, OAuth, certificados) depende de ter um domínio final estável.
2. **Credenciais Google OAuth reais** — o código já está pronto; é só configuração. Ativa o login social nas duas plataformas de imediato.
3. **Contas de loja (Apple + Google)** — o registo demora dias a ser aprovado (sobretudo a Apple), por isso vale a pena começar cedo, em paralelo com o resto.
4. **Preencher e mandar rever os Termos/Privacidade + abrir atividade nas Finanças** — condição legal para cobrar seja o que for.
5. **Stripe + Stripe Connect** — o maior bloco de trabalho de engenharia que falta. Sem isto, não há negócio real, só um catálogo.
6. **Sentry + um pipeline básico de CI** — barato de fazer agora, caro de fazer depois de já haver utilizadores reais a sofrer com bugs não detetados.
7. **Notificações push** — melhora retenção, mas o email já cobre o essencial; não é bloqueador.
8. **Testes automatizados dos fluxos críticos** — em paralelo com o resto, não como bloqueador único.

---

## 5. Plataformas e software sugeridos

| Necessidade | Já em uso | Alternativa a considerar | Quando trocar |
|---|---|---|---|
| Pagamentos | — (a implementar) | **Stripe** (já é o plano documentado) | — |
| Alojamento site | Vercel | — | Só se precisares de mais controlo do que Vercel dá |
| Alojamento API | Railway | Render, Fly.io | Se o custo por uso do Railway ficar caro em escala |
| Base de dados | PostgreSQL (Railway) | Supabase, Neon | Se quiseres um plano gratuito maior ou funcionalidades extra (ex.: Supabase Auth, se um dia quiseres simplificar) |
| Armazenamento de ficheiros | Cloudflare R2 | — | R2 já é a opção mais barata da categoria (sem custo de saída de dados) |
| Email transacional | Resend | Postmark, SendGrid | Só se precisares de funcionalidades que o Resend não tenha |
| Notificações push | — (a implementar) | **Firebase Cloud Messaging** | Standard da indústria, grátis |
| Monitorização de erros | — | **Sentry** | Nível gratuito cobre o piloto |
| Analytics de produto | — | **Plausible** ou **PostHog** | Mais simples e mais amigável para RGPD do que Google Analytics |
| Disponibilidade (uptime) | — | **UptimeRobot** | Grátis, avisa se o site/API cair |
| CI/CD | — | **GitHub Actions** | Grátis para repositórios pequenos/privados com poucas execuções |
| Apoio ao cliente | — | Uma caixa de email dedicada chega para o piloto; **Crisp** ou **Tawk.to** (grátis) se quiseres chat ao vivo mais tarde | Só quando o volume de pedidos de suporte justificar |

---

## Nota final

O produto, tal como está hoje, **já é usável de ponta a ponta** para um piloto fechado (amigos, conhecidos, uma zona geográfica pequena) sem cobrar dinheiro nenhum — todas as funcionalidades core foram testadas ao vivo nesta sessão. O que falta é exatamente o que separa "um produto que funciona" de "um negócio que pode cobrar e ser publicado nas lojas": pagamentos, credenciais reais, contas de loja, e formalidades legais. Nenhum destes itens exige reescrever nada do que já existe — é configuração e um módulo novo (pagamentos).
