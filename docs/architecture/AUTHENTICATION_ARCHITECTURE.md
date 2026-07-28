# Low Prices — Arquitetura de Autenticação

## 1. Visão geral

Autenticação stateless via **JWT de acesso** (curta duração) + **refresh token opaco rotativo** (longa duração, guardado como hash em BD). Este modelo permite validar a maioria dos pedidos sem tocar na base de dados (só verificar a assinatura do JWT), mantendo ao mesmo tempo a capacidade de **revogar sessões** a qualquer momento — coisa que um JWT "puro" (sem componente em BD) não permite.

| Token | Onde vive | Duração | Guardado como |
|---|---|---|---|
| Access Token | Memória (web) / Secure Storage (mobile) | 15 min | JWT assinado (não persistido em BD) |
| Refresh Token | Cookie httpOnly (web) / Secure Storage (mobile) | 30 dias | Hash SHA-256 na tabela `RefreshToken` |

---

## 2. Modelo de dados (Prisma)

- **`Session`** — representa um dispositivo/login ativo (1 sessão = 1 "estás com sessão iniciada neste telemóvel/browser"). Tem `userAgent`, `ipAddress`, `revokedAt`.
- **`RefreshToken`** — pertence a uma `Session`. Cada rotação cria uma nova linha; a antiga fica marcada com `revokedAt` + `replacedById`, nunca é apagada (necessário para detetar reutilização).
- **`VerificationToken`** / **`PasswordResetToken`** — preparados para verificação de email e recuperação de password (fluxos ainda não implementados nesta fase).
- **`AuditLog`** — regista `USER_REGISTERED`, `USER_LOGGED_IN`, `LOGIN_FAILED`, `TOKEN_REFRESHED`, `TOKEN_REUSE_DETECTED`, `USER_LOGGED_OUT(_ALL)`, `PROFILE_UPDATED`, `ACCOUNT_DELETED`.

---

## 3. Fluxo de Registo

1. `POST /auth/register` — valida `RegisterDto` (nome, email, password com regra de maiúscula+minúscula+número, role `CLIENT`/`PROFESSIONAL`).
2. Verifica email único.
3. Password é hasheada com **Argon2id** (recomendação atual da OWASP — mais resistente a ataques por GPU/ASIC do que bcrypt).
4. Cria o `User` e o perfil correspondente à role (`clientProfile`/`professionalProfile`) — nunca existe um `User` órfão sem perfil.
5. Emite os tokens (ver secção 5) e regista `USER_REGISTERED` no `AuditLog`.

## 4. Fluxo de Login

1. `POST /auth/login` — procura o utilizador por email.
2. **Mensagem de erro idêntica** quer o email não exista quer a password esteja errada ("Email ou palavra-passe incorretos") — evita enumeração de contas.
3. Verifica a password com `argon2.verify`.
4. Emite os tokens e regista `USER_LOGGED_IN` (ou `LOGIN_FAILED` em caso de falha).

## 5. Emissão de tokens

```
issueTokensForUser(userId, role):
  1. gera refresh token opaco (32 bytes aleatórios, hex) — NUNCA um JWT
  2. cria Session + RefreshToken (guarda só o hash SHA-256)
  3. assina access token JWT: { sub: userId, role, sid: sessionId }
  4. devolve { accessToken, refreshToken (raw), user }
```

O refresh token é **opaco** (uma string aleatória sem estrutura interpretável), ao contrário do access token que é um JWT. Isto é intencional: um refresh token não precisa de ser autocontido — o servidor consulta sempre a BD para o validar, por isso não há vantagem em ser um JWT, e ser opaco reduz a superfície de ataque (nada a descodificar).

## 6. Fluxo de Refresh (com rotação e deteção de roubo)

```
POST /auth/refresh (cookie ou body)
  1. hash SHA-256 do token recebido
  2. procura RefreshToken por esse hash
  3. SE não existe, expirou, ou a Session está revogada -> 401
  4. SE já está revoked (revokedAt != null) -> ALGUÉM REUTILIZOU UM TOKEN JÁ SUBSTITUÍDO:
       - revoga TODAS as sessões do utilizador
       - regista TOKEN_REUSE_DETECTED no AuditLog
       - devolve 401 ("Atividade suspeita detetada")
  5. Caso normal: gera novo refresh token, marca o antigo como
     revoked+replacedById, cria a nova linha na MESMA sessão
  6. Assina novo access token
  7. Devolve { accessToken, refreshToken (novo, raw), user }
```

A deteção de reuso é a defesa mais importante deste sistema: se um refresh token for roubado (ex.: dispositivo comprometido) e tanto o atacante como o dono legítimo tentarem usá-lo, o primeiro a usar "ganha" a rotação; quando o segundo tentar (com o token agora já substituído), o sistema deteta e derruba todas as sessões — limitando a janela de dano.

## 7. Logout / Logout Global

- **`POST /auth/logout`** — revoga apenas a `Session` associada ao token atual (o dispositivo em uso).
- **`POST /auth/logout-all`** — revoga todas as `Session` do utilizador (ex.: "Suspeito que a minha conta foi acedida por outra pessoa").

## 8. Guards e Roles

- **`JwtAuthGuard` é global** (`APP_GUARD`) — por defeito, **toda a rota exige um access token válido**. Para tornar uma rota pública, usar `@Public()` (ex.: `/health`, `/auth/login`, `/auth/register`, `/auth/refresh`).
- **`RolesGuard`** também é global, mas só age em rotas marcadas com `@Roles(UserRole.ADMIN)` (por exemplo) — sem o decorator, deixa passar.
- **`@CurrentUser()`** extrai `{ userId, role, sessionId }` do request (posto lá pelo `JwtStrategy` depois de validar o JWT).

```typescript
@Roles(UserRole.ADMIN)
@Get('admin/users')
listAllUsers() { ... }
```

## 9. Segurança adicional

- **Rate limiting**: `ThrottlerModule` global (100 pedidos/min por IP) + limites mais apertados em `/auth/register` (5/min) e `/auth/login` (10/min) via `@Throttle()`.
- **Helmet**: cabeçalhos HTTP seguros por defeito (`main.ts`).
- **CORS restrito**: só as origens em `CORS_ORIGIN` (env var); `credentials: true` obrigatório para o cookie do refresh token funcionar entre domínios.
- **`ValidationPipe` global** com `whitelist: true, forbidNonWhitelisted: true` — qualquer campo não esperado no corpo do pedido é rejeitado (proteção contra mass assignment).
- **`GlobalExceptionFilter`**: erros não tratados (bugs, falhas de infraestrutura) nunca expõem stack traces ao cliente — só uma mensagem genérica; o detalhe fica só no log do servidor.
- **Eliminação de conta é sempre soft-delete**: o `User` nunca é apagado fisicamente (mantém integridade com pedidos/avaliações passadas); o email é anonimizado para libertar a unicidade (RGPD).

---

## 10. Fluxo no Website (Next.js)

```
Login (LoginForm) -> POST /auth/login (axios, withCredentials)
  -> access token guardado em memória (ver services/api/auth-session.ts)
  -> refresh token: NUNCA tocado pelo JS -- vive só no cookie httpOnly
     que o browser envia automaticamente em pedidos seguintes

Qualquer pedido com 401 -> interceptor de resposta do axios chama
  POST /auth/refresh (cookie enviado automaticamente pelo browser)
  -> novo access token guardado em memória, pedido original repetido

Logout -> POST /auth/logout -> limpa o access token em memória
  (o cookie é limpo pelo próprio backend na resposta)
```

`AuthProvider` (`apps/web/src/providers/auth-provider.tsx`) expõe `user`, `isAuthenticated`, `login()`, `register()`, `logout()` ao resto da app via contexto React.

**Limitação conhecida e documentada (não escondida):** o `middleware.ts` do website tenta ler o cookie do refresh token para proteger rotas ao nível do servidor, mas esse cookie é definido pelo domínio da API — em desenvolvimento local (origens diferentes) e em produção sem domínio partilhado, o middleware não o consegue ler (cookies não atravessam origens). Por isso, **a proteção de rotas real nesta fase acontece no cliente**, via `useAuth()` em cada página privada. O middleware fica pronto para quando a API e o Website partilharem domínio em produção, ou quando o Website passar a fazer proxy dos pedidos (`next.config.ts` rewrites) — nenhum dos dois está implementado ainda.

## 11. Fluxo na App Mobile (Flutter)

```
Login (LoginPage) -> AuthRepository.login() -> ApiService.guard(() => dio.post('/auth/login'))
  -> accessToken e refreshToken (ambos no body da resposta, já que não há cookies no mobile)
  -> StorageService guarda os dois no secure storage nativo (Keychain/Keystore)

ApiService injeta o accessToken em todos os pedidos automaticamente
(interceptor onRequest)

401 numa resposta -> refreshAccessToken() chama POST /auth/refresh
  com o refreshToken guardado -> novo par de tokens persistido

Logout -> AuthRepository.logout() -> POST /auth/logout -> limpa o
secure storage
```

`AuthRepositoryImpl` substitui o `StubAuthRepository` — a assinatura (`Result<void>`) mantém-se, por isso nenhum ecrã precisou de ser alterado.

---

## 12. O que falta (fora do âmbito desta fase, intencionalmente)

- Verificação de email (`VerificationToken` já existe no schema, endpoint por implementar)
- Recuperação de password (`PasswordResetToken` já existe no schema, endpoint por implementar)
- Login social (Google/Apple) — mencionado na fundação técnica como necessário antes do lançamento em App Store, ainda não iniciado
- Endpoint de listagem/gestão de sessões ativas ("Terminar sessão neste dispositivo" a partir de uma lista) — o modelo de dados já suporta, falta só o endpoint
