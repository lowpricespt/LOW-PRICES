# LOW PRICES — Bloco de Notas Completo

*Atualizado no momento desta fase. Serve como referência única de tudo o que existe, onde está, e o que falta.*

---

## 1. O que é a Low Prices

Marketplace que liga Clientes a Profissionais independentes para serviços locais (canalizador, eletricista, pintor, etc.) — modelo tipo TaskRabbit/Fixando, focado em Portugal.

---

## 2. Estado de produção (AO VIVO agora mesmo)

| Peça | Onde está | URL |
|---|---|---|
| Website | Vercel | `https://low-prices-web-delta.vercel.app` |
| Backend (API) | Railway | `https://low-pricesapi-production.up.railway.app` |
| Base de dados | Railway (PostgreSQL) | interna (`Postgres.DATABASE_URL`) |
| Cache/filas | Railway (Redis) | interna (`Redis.REDIS_URL`) |
| Repositório | GitHub | `github.com/lowpricespt/LOW-PRICES` |

**Confirmado a funcionar:** registo de Cliente, login, `/health`, Perfil (nome/telefone/avatar), dashboards navegáveis.
**Bug corrigido nesta fase:** registo de Especialista (`/registo/profissional`) não estava ligado ao backend — corrigido, Passo 1 do wizard já cria conta real.

---

## 3. Stack técnica

- **Mobile:** Flutter/Dart, Riverpod, go_router, Dio, flutter_secure_storage
- **Web:** Next.js 15 (`^15.5.9`, por causa de CVEs corrigidas), React 19, Tailwind, shadcn/ui, TanStack Query, Zustand, Axios, Zod
- **Backend:** NestJS, PostgreSQL+PostGIS, Prisma, Redis, JWT+refresh tokens, Argon2, Passport (JWT + Google OAuth)
- **Infra:** Docker (dev local), Turborepo, pnpm workspaces
- **Deploy:** Vercel (website) + Railway (backend+BD+Redis)

---

## 4. Módulos do Backend (o que existe)

| Módulo | Estado |
|---|---|
| Auth (registo/login/refresh/logout) | Completo, incluindo Login com Google e recuperação de password real (email via Resend) |
| Users (perfil) | nome/telefone/avatar reais |
| Requests (pedidos de serviço) | criar, publicar, listar (mine/available), bloqueio de localização por plano |
| Matching | serviço dedicado, categoria+subcategoria |
| Quotes (orçamentos) | enviar, aceitar (cria Job), recusar |
| Jobs | novo — `GET /jobs/me`, `GET /jobs/:id`, revela contacto da outra parte (substituto do Chat no piloto) |
| Storage (Cloudflare R2) | código pronto, resiliente à falta de credenciais |
| Pricing | Comissão + Acesso à Área (100€/mês, 30€/semana, raio até 150km) |
| Email | novo — `EmailService` via Resend, resiliente à falta de configuração |
| Chat completo (tempo real) | ❌ substituído pela revelação de contacto no piloto |
| Notificações (Push/Email/SMS) | só arquitetura documentada, sem envio automático |
| Pagamentos (Stripe) | só arquitetura documentada; `activate-simulated` é o substituto |
| Agenda do Profissional | só arquitetura documentada |
| Avaliações | schema existe, sem endpoints |

---

## 5. Schema da Base de Dados (Prisma) — resumo

19+ modelos: User (agora com googleId opcional), ClientProfile, ProfessionalProfile, Address, Document, PortfolioItem, Favorite, NotificationPreference, ServiceCategory (com subcategorias), ServiceRequest, ServiceRequestMatch, Quote, Job, Session, RefreshToken, AuditLog, etc.

Migration pendente por aplicar no Railway — o schema mudou nesta fase (googleId, passwordHash opcional). Ver secção 8.

---

## 6. Módulos do Website — o que existe

- Landing page completa (Header, Hero, HowItWorks, Categorias, Benefícios, Testemunhos, FAQ, Footer)
- Wizards: Pedir Serviço (8 passos), Registo de Profissional (9 passos, Passo 1 já ligado ao backend)
- Dashboards Cliente + Profissional: navegação completa (20 secções), 2 páginas de referência 100% reais (Home, "Os meus pedidos"), resto em StubSection
- Perfil Cliente real (nome/telefone/avatar, upload ligado ao R2)
- Página Premium real (planos 100€/mês, 30€/semana, vindos do backend)
- Termos de Serviço e Política de Privacidade — novo nesta fase, à espera da tua revisão
- Login com Google — novo nesta fase, botão pronto nos dois formulários

---

## 7. Mobile (Flutter) — o que existe

- Fundação completa (tema, router, design system)
- Wizard Cliente (8 passos) e Wizard Profissional (9 passos) — ainda visuais, não ligados ao registo real
- Dashboards com bottom navigation
- ImageService continua stub (upload real não ligado)
- Testado contra o backend de produção via --dart-define=API_BASE_URL=https://low-pricesapi-production.up.railway.app

---

## 8. AÇÕES QUE SÓ TU PODES FAZER (bloqueiam funcionalidades)

1. Migration do schema no Railway (googleId/passwordHash) — consola do Railway:
   cd apps/api && pnpm exec prisma db push

2. Credenciais Google OAuth — criar em console.cloud.google.com -> "APIs & Services" -> "Credentials" -> "OAuth Client ID" -> tipo "Web application" -> Authorized redirect URI: https://low-pricesapi-production.up.railway.app/auth/google/callback
   Depois adiciona no Railway: GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_CALLBACK_URL.

3. Credenciais Cloudflare R2 — para o upload de fotos/documentos funcionar de verdade.

4. Revisão jurídica dos Termos/Privacidade — preencher os campos [entre parênteses] com os dados reais da empresa.

5. Domínio próprio (opcional) — atualmente em .vercel.app / .railway.app.

6. Conta Stripe — necessária antes dos planos Premium aceitarem pagamento real.

---

## 9. Bugs corrigidos ao longo do deploy (para referência futura)

- ERR_PNPM_EBUSY no Windows -> causado pelo OneDrive a sincronizar a pasta do projeto; resolvido movendo para C:\Dev
- noUncheckedIndexedAccess a rebentar o build com componentes de wizard indexados por array -> corrigido com "!" (non-null assertion), não "??"
- next/og (opengraph-image/apple-icon) com bug conhecido do Next.js no Windows -> desativados localmente, ficheiros preservados em docs/architecture/*.disabled-windows-bug
- CVEs críticas do Next.js (RCE) -> atualizado 15.0.3 -> ^15.5.9
- Railway a ignorar Build/Start Command personalizados, e a cachear a camada de install antes do postinstall (prisma generate) existir -> resolvido com bump de versão para forçar invalidação de cache
- R2StorageProvider e JwtStrategy a rebentar o arranque da app por falta de configuração opcional -> R2StorageProvider tornado resiliente (lazy init); JWT_ACCESS_SECRET mantido obrigatório por ser mesmo crítico
- package.json de apps/web e apps/api trocados entre pastas (várias vezes) -> sempre confirmar pelo campo "name" antes de aplicar um ficheiro

---

## 11. Fase — Bloqueio de informação + conta obrigatória (mais recente)

**Feito, real, testável:**
- `ProfessionalProfile.hasAreaAccess` + `areaAccessExpiresAt` (schema novo — **precisa de `prisma db push` no Railway outra vez**)
- `ServiceRequestResponseDto` esconde `location`/coordenadas exatas de profissionais sem plano ativo; cliente dono e profissionais com plano veem tudo
- `POST /pricing/area-access/activate-simulated` — ativa o acesso sem cobrar, para testar já; será substituído pelo webhook do Stripe sem tocar no resto do sistema
- `/pedir-servico` agora exige conta (`RequireAuth`), redireciona para `/login?next=/pedir-servico` e volta automaticamente depois de entrar
- Wizard do Cliente ligado ao backend real (cria + publica o pedido a sério — antes era só visual, como o do Profissional era antes da fase anterior)
- Corrigido preventivamente: `useSearchParams()` sem `<Suspense>` no `/login` (ia rebentar o build, mesma categoria de erro do `noUncheckedIndexedAccess`)

**Não feito nesta fase (pedido era muito grande, priorizado o que dava mais valor imediato):**
- Chat — continua só arquitetura
- Agenda do Profissional (calendário 3 dias/semana/mês) — continua só arquitetura
- Avaliações — schema existe, endpoints não
- Notificações reais — continua só arquitetura
- Pagamentos reais (Stripe) — continua só arquitetura; o botão "activate-simulated" é o substituto temporário

## 12. Substituto do Chat para o piloto — revelar contacto ao aceitar orçamento

Módulo `Jobs` novo (`apps/api/src/modules/jobs/`) — quando um orçamento é aceite, o `Job` já existia (criado por `QuotesService.accept()`), mas agora tem endpoints próprios:
- `GET /jobs/me` — lista os trabalhos do utilizador atual (cliente ou profissional, automático pela role)
- `GET /jobs/:id` — detalhe de um trabalho, incluindo o contacto (nome/email/telefone) da **outra parte** — nunca o próprio

Página real no Website: `/dashboard/profissional/trabalhos-aceites` já mostra o contacto do cliente assim que um orçamento é aceite. **Falta o lado do Cliente** (ver contacto do profissional) — mesmo padrão, é só replicar a página noutra rota.

Isto substitui o Chat completo por agora — mais rápido de construir, valida o "core loop" do piloto sem investir tempo em WebSockets antes de saber se há procura.

## 14. Fase — Raio 150km, recuperação de password real, proposta de planos

**Feito, real:**
- Raio máximo alterado de 50km para 150km (Website + Mobile)
- Recuperação de password real: `POST /auth/forgot-password`, `POST /auth/reset-password`, páginas `/recuperar-password` e `/redefinir-password` no Website — **precisa de `RESEND_API_KEY` no Railway para enviar o email de verdade** (sem ela, fica registado em log, não bloqueia a app)
- Ecrã final do registo de Profissional agora propõe logo os planos (`/dashboard/profissional/premium`)

**Não feito nesta fase (pedido tinha mais 4 frentes grandes):**
- Sugestões de morada reais (Google Places) — precisa de decisão de implementação + `GOOGLE_MAPS_API_KEY`
- Agenda/Calendário do Profissional
- Avaliações
- Stripe real (o `activate-simulated` continua a ser o substituto)

## 15. AÇÃO NOVA que só tu podes fazer

- **Migration nova no Railway** (schema não mudou nesta fase — sem ação extra aqui)
- **Configurar `RESEND_API_KEY`** em [resend.com](https://resend.com) (tem tier gratuito) para a recuperação de password enviar emails de verdade

## 16. Roadmap pós-piloto (continuação)

1. Aplicar as migrations pendentes (secção 8.1) — desbloqueia tudo o resto
2. Configurar Google OAuth (secção 8.2) — ativa o Login com Google
3. Configurar Cloudflare R2 (secção 8.3) — ativa upload de fotos/documentos
4. Perfil Especialista completo (Website) — depende do R2
5. Chat (arquitetura já documentada, falta o código)
6. Notificações reais (Push/Email) — dá vida ao "cliente publica pedido -> profissional recebe"
7. Stripe — ativa os planos Premium e a comissão de verdade
8. Auditoria de responsividade (precisa da tua confirmação visual em vários tamanhos de ecrã)
9. Mobile: ligar registo de Profissional + upload real (mesmo trabalho que já foi feito no Website)
