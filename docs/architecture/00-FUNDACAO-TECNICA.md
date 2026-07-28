# LOW PRICES — Fundação Técnica do Projeto
**Documento oficial v1.0 — CTO / Principal Architect**

---

## 1. Arquitetura Geral

Vamos usar uma arquitetura de **monorepo modular**, com um único backend (NestJS) a servir todos os clientes (Flutter, Next.js, Painel Admin) através de uma única API REST + WebSocket.

```
┌─────────────┐   ┌─────────────┐   ┌──────────────┐
│  App Flutter │   │  Next.js Web │   │ Painel Admin │
│ (iOS/Android)│   │  (clientes/  │   │  (Next.js)   │
│              │   │ profissionais│   │              │
└──────┬───────┘   └──────┬───────┘   └──────┬───────┘
       │                  │                   │
       └──────────────────┼───────────────────┘
                           │  HTTPS / WSS
                  ┌────────▼─────────┐
                  │   API Gateway     │
                  │   NestJS (REST +  │
                  │   WebSocket)      │
                  └────────┬─────────┘
       ┌───────────────────┼───────────────────┐
┌──────▼──────┐   ┌────────▼────────┐   ┌───────▼──────┐
│ PostgreSQL  │   │      Redis       │   │ Cloudflare R2│
│  (Prisma)   │   │ (cache/sessions/ │   │  (ficheiros) │
│             │   │  filas)          │   │              │
└─────────────┘   └─────────────────┘   └──────────────┘
       │
┌──────▼──────────────────────────────────────────┐
│ Integrações externas: Stripe, Google Maps, FCM   │
└───────────────────────────────────────────────────┘
```

**Porquê esta abordagem (e não microserviços já de início):**
- Vantagem: um único deploy, um único ponto de debug, desenvolvimento mais rápido para uma equipa pequena, custo de infraestrutura muito menor.
- Desvantagem: menos isolamento de falhas; escalar módulos individualmente é mais difícil.
- **Recomendação:** Monólito modular (NestJS com módulos bem separados por *feature*) agora; extrair microserviços (ex.: pagamentos, notificações) apenas quando o volume o justificar. Isto é o padrão usado por Stripe, Uber e Airbnb nas suas fases iniciais — microserviços prematuros são a principal causa de overengineering em MVPs.

---

## 2. Estrutura do Monorepo

```
low-prices/
├── apps/
│   ├── api/                # Backend NestJS
│   ├── web/                # Next.js (site cliente/profissional)
│   ├── admin/              # Next.js (painel administração)
│   └── mobile/             # Flutter (Android + iOS)
├── packages/
│   ├── shared-types/       # Tipos TS partilhados (DTOs, enums) entre api/web/admin
│   ├── ui/                 # Componentes UI partilhados (web + admin)
│   └── config/             # ESLint, TSConfig, Prettier partilhados
├── infra/
│   ├── docker/              # Dockerfiles + docker-compose
│   ├── k8s/                 # (futuro — não usado no MVP)
│   └── scripts/             # scripts de deploy/migração
├── docs/
│   ├── architecture/
│   ├── api/                # OpenAPI/Swagger exportado
│   └── decisions/          # ADRs (Architecture Decision Records)
├── .github/workflows/       # CI/CD
├── package.json             # workspace root (Turborepo/pnpm)
├── turbo.json
└── pnpm-workspace.yaml
```

**Ferramenta de monorepo:** `pnpm workspaces` + `Turborepo` (build cache, paralelização de tasks). É o standard atual da indústria para monorepos TS (usado por Vercel, e é leve — sem necessidade de Nx que traz complexidade extra).

O Flutter fica dentro do monorepo por organização, mas tem o seu próprio ciclo de build/dependências (pub, não npm).

---

## 3. Organização do Backend (`apps/api`)

Clean Architecture + Feature-Based, dentro do NestJS:

```
apps/api/src/
├── main.ts
├── app.module.ts
├── config/                  # configuração (env validation com Zod/Joi)
├── common/
│   ├── decorators/
│   ├── filters/              # exception filters globais
│   ├── guards/                # JwtAuthGuard, RolesGuard
│   ├── interceptors/
│   └── pipes/
├── infra/
│   ├── prisma/                # PrismaService, schema.prisma
│   ├── redis/
│   ├── storage/                # Cloudflare R2 client
│   └── websocket/
├── modules/
│   ├── auth/
│   │   ├── domain/              # entidades, interfaces (regras de negócio puras)
│   │   ├── application/         # use-cases/services
│   │   ├── infrastructure/      # repositórios (Prisma), controllers
│   │   └── auth.module.ts
│   ├── users/
│   ├── professionals/
│   ├── services-catalog/        # categorias de serviços
│   ├── requests/                # pedidos de serviço
│   ├── quotes/                  # orçamentos
│   ├── chat/
│   ├── payments/
│   ├── reviews/
│   ├── notifications/
│   └── admin/
└── shared/                      # value-objects, erros de domínio
```

Cada módulo segue: `controller → use-case (application) → repository interface (domain) → repository implementation (infrastructure com Prisma)`. Isto dá Dependency Injection e Repository Pattern "de fábrica" via NestJS.

---

## 4. Organização do Flutter (`apps/mobile`)

Arquitetura **feature-first + camadas** (equivalente Clean Architecture em Flutter):

```
apps/mobile/lib/
├── main.dart
├── core/
│   ├── network/           # dio client, interceptors (JWT refresh)
│   ├── theme/
│   ├── routing/            # go_router
│   ├── di/                 # injeção de dependências (get_it + injectable)
│   └── errors/
├── features/
│   ├── auth/
│   │   ├── data/            # datasources, repositórios (impl)
│   │   ├── domain/          # entidades, repositórios (interface), use-cases
│   │   └── presentation/    # pages, widgets, state (Riverpod/Bloc)
│   ├── onboarding/
│   ├── client/
│   │   ├── request_service/
│   │   ├── history/
│   │   └── favorites/
│   ├── professional/
│   │   ├── job_feed/
│   │   ├── agenda/
│   │   └── stats/
│   ├── chat/
│   ├── payments/
│   └── reviews/
└── shared_widgets/
```

**Gestão de estado recomendada:** Riverpod (mais moderno, testável e com menos boilerplate que Bloc para uma equipa pequena a mover-se depressa). Alternativa: Bloc, mais verboso mas mais "opinativo" — útil em equipas grandes. Para um MVP com equipa pequena, Riverpod ganha.

---

## 5. Organização do Website (`apps/web` e `apps/admin`)

Next.js (App Router):

```
apps/web/src/
├── app/
│   ├── (public)/            # landing, categorias, SEO
│   ├── (auth)/              # login, registo
│   ├── (client)/            # área do cliente
│   ├── (professional)/      # área do profissional
│   └── api/                 # apenas rotas proxy/webhooks se necessário
├── components/
├── features/                # mesma lógica feature-based do backend
├── lib/
│   ├── api-client.ts         # cliente HTTP tipado (usa shared-types)
│   └── auth/
└── styles/
```

O painel Admin (`apps/admin`) segue a mesma estrutura, isolado como app próprio (permissões e superfície de ataque diferentes do site público).

---

## 6. Estrutura Inicial da Base de Dados

Entidades core do MVP (Prisma):

- **User** (base): id, email, phone, passwordHash, role (CLIENT/PROFESSIONAL/ADMIN), status, createdAt
- **ClientProfile**: userId, favoriteCategories[]
- **ProfessionalProfile**: userId, bio, documents[], verificationStatus, categories[], serviceRadius, rating
- **ServiceCategory**: id, name, slug, icon
- **ServiceRequest**: id, clientId, categoryId, description, location (geo), status, scheduledAt
- **Quote**: id, requestId, professionalId, price, message, status (PENDING/ACCEPTED/REJECTED)
- **Job**: id, requestId, quoteId, status (SCHEDULED/IN_PROGRESS/DONE/CANCELLED)
- **Payment**: id, jobId, amount, provider, providerRef, status
- **Message**: id, jobId (ou requestId), senderId, content, createdAt
- **Review**: id, jobId, authorId, targetId, rating, comment
- **Report** (denúncias): id, reporterId, targetId, reason, status
- **Notification**: id, userId, type, payload, readAt

Relações principais: `User 1—1 ClientProfile/ProfessionalProfile`, `ServiceRequest 1—N Quote`, `Quote 1—1 Job`, `Job 1—N Message/Payment/Review`.

Localização geográfica: usar `PostGIS` (extensão Postgres) para queries de proximidade — é o standard da indústria (usado por Uber/Bolt) em vez de calcular distância em código.

---

## 7. Estratégia de Autenticação

- **JWT de acesso** (curta duração, 15 min) + **Refresh Token** (longa duração, 30 dias, rotativo, guardado em Redis para permitir revogação).
- Login: email/password (bcrypt/argon2) + opção de login social (Google/Apple) preparada desde o início (obrigatório para App Store — Apple exige "Sign in with Apple" se houver outros logins sociais).
- Refresh token rotation: cada uso gera novo par e invalida o anterior (deteta reutilização = possível roubo de token → revoga sessão toda).
- Mobile: tokens em `flutter_secure_storage`. Web: refresh token em cookie `httpOnly` + `secure`; access token em memória.

---

## 8. Estratégia de Permissões

- **RBAC simples no MVP**: roles fixas (CLIENT, PROFESSIONAL, ADMIN) via `RolesGuard` no NestJS + decorator `@Roles()`.
- Preparar para **ABAC leve** mais tarde (ex.: um profissional só pode aceder aos dados de um `Job` onde está envolvido) — implementado já no MVP como *ownership checks* dentro dos use-cases (não é RBAC, mas é essencial desde o dia 1 para segurança).
- Admin com granularidade futura (moderador vs. admin total) documentada, não implementada no MVP.

---

## 9. Estratégia de Segurança

- HTTPS obrigatório em todos os ambientes (mesmo staging).
- Rate limiting (NestJS `@nestjs/throttler`) em endpoints públicos e de auth.
- Validação de input estrita com `class-validator`/`zod` em todos os DTOs.
- Helmet para headers HTTP seguros.
- Segredos geridos via variáveis de ambiente + gestor de secrets do provedor de cloud (nunca em git).
- Uploads de documentos de profissionais: verificação de tipo/tamanho de ficheiro, URLs assinadas e temporárias no R2 (nunca públicas por defeito).
- Logs sem dados sensíveis (PII mascarado).
- Auditoria: tabela `AuditLog` para ações administrativas sensíveis (banimentos, resoluções de disputas, alterações de pagamento).
- Conformidade RGPD: eliminação/anonimização de conta a pedido, política de retenção de dados documentada.

---

## 10. Estratégia de Deployment

- **Ambientes:** local (Docker Compose) → staging → produção.
- **Backend:** container Docker, deploy num serviço gerido (ex.: Railway, Render ou AWS ECS/Fargate) — evitar Kubernetes no MVP (overengineering para a fase atual).
- **Base de dados:** Postgres gerido (ex.: Neon, Supabase ou RDS) com backups automáticos diários.
- **Web/Admin:** Vercel (nativo para Next.js, deploy trivial, edge caching).
- **Mobile:** builds via Fastlane/Codemagic → TestFlight (iOS) e Play Console (internal testing → produção).
- **CI/CD:** GitHub Actions — lint + testes + build em cada PR; deploy automático em merge para `main` (staging) e tag de release (produção).

---

## 11. Estratégia de Testes

- **Backend:** testes unitários (Jest) nos use-cases (domínio puro, sem mocks complexos); testes de integração nos repositórios (Prisma contra Postgres real via Testcontainers); testes e2e (Supertest) nos endpoints críticos (auth, criação de pedido, pagamento).
- **Flutter:** testes de widget para componentes-chave; testes unitários para use-cases; testes de integração para fluxos críticos (pedir serviço, aceitar trabalho).
- **Web:** testes unitários (Vitest) + alguns e2e (Playwright) nos fluxos críticos de conversão.
- Meta pragmática para MVP: cobertura alta apenas nos fluxos críticos (auth, pedidos, pagamentos) — não perseguir 100% de cobertura geral, isso é overengineering nesta fase.

---

## 12. Roadmap Completo (60 dias)

| Fase | Duração | Conteúdo |
|---|---|---|
| Fase 0 | 2 dias | Fundação (este documento) + setup de repositório, CI, ambientes |
| Fase 1 | 3 dias | Scaffolding do monorepo (backend, web, admin, mobile) a correr localmente |
| Fase 2 | 5 dias | Auth completo (registo, login, refresh, roles) nas 3 plataformas |
| Fase 3 | 4 dias | Perfis (Cliente e Profissional) + upload de documentos |
| Fase 4 | 3 dias | Categorias de serviços (CRUD admin + listagem pública) |
| Fase 5 | 6 dias | Fluxo de pedido de serviço (cliente pede → profissionais próximos recebem) |
| Fase 6 | 5 dias | Orçamentos (profissional propõe, cliente aceita/recusa) |
| Fase 7 | 5 dias | Chat em tempo real (WebSocket) |
| Fase 8 | 6 dias | Pagamentos (Stripe: pagamento + payout ao profissional) |
| Fase 9 | 4 dias | Avaliações e histórico |
| Fase 10 | 4 dias | Notificações push (FCM) |
| Fase 11 | 4 dias | Painel de Administração (utilizadores, denúncias, disputas) |
| Fase 12 | 4 dias | Polimento UX, QA end-to-end, correção de bugs |
| Fase 13 | 3 dias | Preparação de lançamento (App Store/Play Store review, monitorização, analytics) |
| Fase 14 | 2 dias | Buffer de contingência |

Total: ~60 dias úteis.

---

## 13. Ordem Exata de Desenvolvimento

1. Setup do monorepo + Docker Compose (Postgres, Redis) a correr.
2. Schema Prisma inicial + migrations.
3. Módulo Auth (backend) → testado via Postman/Swagger.
4. Integração Auth no Flutter e no Next.js.
5. Perfis de utilizador (Cliente/Profissional).
6. Categorias de serviço.
7. Pedido de serviço + geolocalização.
8. Orçamentos.
9. Chat.
10. Pagamentos (Stripe Connect para payouts a profissionais).
11. Avaliações.
12. Notificações push.
13. Painel Admin.
14. QA, hardening de segurança, lançamento.

---

## 14. MVP (o que entra na v1.0)

Cliente pede serviço → recebe orçamentos de profissionais próximos → aceita um → conversa por chat → paga → avalia. Profissional recebe pedidos da sua zona/categoria → envia orçamento → aceita trabalho → recebe pagamento. Admin gere utilizadores, categorias e denúncias.

**Fica fora do MVP** (ver secção 15): agendamento recorrente, subscrições/planos, sistema de fidelização, chat de voz/vídeo, faturação automática avançada, multi-idioma, marketplace de materiais.

---

## 15. Funcionalidades Futuras (pós-MVP)

- MB Way / Multibanco como métodos de pagamento ativos (arquitetura já preparada, ativação depois).
- Sistema de subscrição para profissionais (destaque, leads ilimitados).
- Agendamento recorrente (ex.: limpeza semanal).
- Programa de fidelização/pontos.
- Chat de voz/vídeo.
- Multi-idioma (PT/EN/ES).
- App para múltiplos profissionais por empresa (contas de equipa).
- Analytics avançado para profissionais.

---

## 16. Riscos Técnicos

- **Verificação de profissionais**: risco de fraude documental — mitigar com verificação manual no MVP (admin revê documentos), automatizar depois.
- **Disputas de pagamento**: definir política clara de reembolso desde o dia 1 (regra de negócio, não só técnica).
- **Geolocalização em tempo real com muitos utilizadores**: PostGIS resolve para o volume do MVP; reavaliar (ex.: Redis Geo) só se necessário.
- **Onboarding de pagamentos (Stripe Connect)**: complexidade regulatória (KYC dos profissionais) — validar cedo com a Stripe para Portugal.
- **Notificações push em iOS**: exige Apple Developer Program ativo e certificados corretos — tratar isto na Fase 0 para não bloquear depois.
- **Rate limiting e abuso**: pedidos falsos ou spam de orçamentos — throttling + reputação desde o início.

---

## 17. Melhorias Sugeridas (sem inflar o MVP)

- Feature flags simples (ex.: Unleash ou variável de config) para ativar/desativar funcionalidades sem deploy.
- Observabilidade desde o dia 1: logs estruturados (Pino) + Sentry para erros — barato de implementar agora, caro de adicionar depois.
- Seed de dados de demonstração para testar o app antes de haver utilizadores reais.

---

## 18. Checklist para Iniciar o Desenvolvimento

- [ ] Repositório GitHub criado (privado) com proteção de branch em `main`.
- [ ] Contas criadas: Stripe, Firebase, Google Cloud (Maps), Cloudflare (R2), Apple Developer, Google Play Console.
- [ ] Base de dados Postgres (local via Docker + staging gerido) provisionada.
- [ ] `.env.example` definido para todos os apps.
- [ ] CI (GitHub Actions) configurado com lint + build.
- [ ] Domínio(s) reservado(s) para a plataforma.

---

## 19. Ferramentas a Instalar Antes da Primeira Linha de Código

- Node.js LTS (v20+) e `pnpm`
- Flutter SDK (canal stable) + Android Studio (SDKs Android) + Xcode (só em Mac, para iOS)
- Docker Desktop
- PostgreSQL client (ex.: DBeaver ou TablePlus) — opcional, para inspecionar a BD
- Git
- Um editor: VS Code (recomendado, com extensões Prisma, ESLint, Flutter/Dart) ou Android Studio
- Postman ou Insomnia (testar API)
- Stripe CLI (testar webhooks localmente)

---

## Nota sobre o método de trabalho

A partir daqui, cada resposta vai focar-se numa fase pequena e completamente funcional, com explicação → implementação → instruções de execução/teste → resumo final com próximo passo. A Fase 1 (scaffolding do monorepo) começa já a seguir.
