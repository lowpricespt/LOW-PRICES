# Low Prices — Arquitetura do Monorepo

Referência técnica de como o monorepo está organizado e como as 3 aplicações comunicam entre si.

---

## 1. Organização das pastas

```
low-prices/
├── apps/
│   ├── api/       Backend NestJS — única fonte de dados, única API
│   ├── web/        Website Next.js — consome a API
│   └── mobile/      App Flutter — consome a mesma API
├── infra/
│   └── docker/       Postgres+PostGIS, Redis (desenvolvimento local)
├── docs/
│   ├── architecture/  Documentos técnicos (este ficheiro, Auth, Notificações, fundação original)
│   ├── business/       Modelo de negócio
│   └── context/         PROJECT_CONTEXT.txt (memória viva do projeto)
├── package.json         Raiz do workspace (scripts do Turborepo)
├── pnpm-workspace.yaml    Declara apps/* como workspaces pnpm
├── turbo.json              Configuração das tasks do Turborepo (dev/build/lint/test)
└── .env.example             Variáveis do Backend/Infra (NÃO confundir com apps/web/.env.example)
```

**Regra importante para evitar o erro que já tivemos:** cada `package.json` tem um `name` diferente e claramente identificável —
- raiz: `"name": "low-prices"` (sem dependências de runtime, só scripts+Turborepo)
- `apps/api/package.json`: `"name": "@low-prices/api"`
- `apps/web/package.json`: `"name": "@low-prices/web"`

Se alguma vez um destes ficheiros aparecer com o `name` errado para a pasta onde está, é sinal de que foi trocado — verificar sempre o campo `name` primeiro ao investigar um problema estranho de dependências.

---

## 2. Responsabilidades de cada aplicação

| App | Responsabilidade | Nunca faz |
|---|---|---|
| `apps/api` | Única fonte da verdade dos dados; toda a lógica de negócio; autenticação; envio de notificações | Não tem UI; não decide como algo é apresentado |
| `apps/web` | Interface para browser (clientes e profissionais); SEO; landing page | Não acede à base de dados diretamente; nunca guarda lógica de negócio duplicada da API |
| `apps/mobile` | Interface nativa (iOS/Android); notificações push; câmara/localização nativas | Mesmas regras do web — só UI + chamadas à API |

---

## 3. Comunicação entre Backend, Website e Mobile

```
┌─────────────┐        HTTPS (REST)         ┌──────────────┐
│  Website     │ ───────────────────────────▶│               │
│  (Next.js)   │◀─────────────────────────── │   Backend      │
└─────────────┘   cookie httpOnly (refresh)  │   NestJS       │
                                              │               │
┌─────────────┐        HTTPS (REST)          │  (única API)   │
│  App Mobile  │ ───────────────────────────▶│               │
│  (Flutter)   │◀─────────────────────────── │               │
└─────────────┘   refreshToken no body       └───────┬───────┘
                   (guardado em secure storage)        │
                                                        ▼
                                              ┌──────────────┐
                                              │ PostgreSQL    │
                                              │ + Redis        │
                                              └──────────────┘
```

- **Um único cliente HTTP por plataforma:** `apps/web/src/services/api/axios.ts` e `apps/mobile/lib/services/api_service.dart` — nenhuma feature fala diretamente com `fetch`/`Dio` cru.
- **Autenticação stateless (JWT) + sessão em BD:** o access token não precisa de consultar a BD para ser validado (assinatura), mas o refresh token vive na tabela `Session`/`RefreshToken`, o que permite revogação (logout, logout global, deteção de roubo). Ver `AUTHENTICATION_ARCHITECTURE.md`.
- **Categorias, textos e regras de negócio nunca duplicados:** hoje as categorias de serviço ainda estão hardcoded em cada cliente (`constants/categories.ts` no web, `service_categories.dart` no mobile) por não existir ainda o endpoint — isto é uma dívida técnica identificada, não uma decisão definitiva (ver `PROJECT_CONTEXT.txt`, secção 7).

---

## 4. Convenções

- **Feature-Based Architecture** em todas as apps: `features/<nome>/{components|presentation}`.
- **Nomes de pasta em inglês, texto de UI em português de Portugal.**
- **Nenhum ficheiro de configuração da raiz é copiado para dentro de uma app, nem vice-versa** — cada `package.json`/`.env.example`/`.gitignore` é específico do seu nível (ver secção 1).
- **Documentação centralizada em `docs/`** — nunca criar ficheiros `.md` soltos na raiz a partir de agora.

---

## 5. Dependências (visão geral, não exaustiva)

| Camada | Principais dependências |
|---|---|
| Backend | NestJS, Prisma, `@nestjs/jwt`, `@nestjs/passport` + `passport-jwt`, `@nestjs/throttler`, `argon2`, `helmet`, `cookie-parser`, `class-validator` |
| Website | Next.js 15, React 19, Tailwind, shadcn/ui (via componentes próprios), TanStack Query, Zustand, Axios, Zod |
| Mobile | Flutter, Riverpod, `go_router`, Dio, `flutter_secure_storage`, `shared_preferences` |
| Infra | Docker (Postgres+PostGIS, Redis), Turborepo, pnpm workspaces |

---

## 6. Scripts

**Raiz do monorepo:**
```bash
pnpm install        # instala tudo (workspaces)
pnpm dev             # corre api + web em paralelo via Turborepo
pnpm build           # build de produção de todas as apps
pnpm db:up           # sobe Postgres + Redis
pnpm db:down         # para os containers
```

**Dentro de `apps/api`:**
```bash
pnpm dev                              # nest start --watch
pnpm prisma:generate                   # gera o Prisma Client
pnpm prisma:migrate --name <nome>       # cria e aplica uma migration
```

**Dentro de `apps/web`:**
```bash
pnpm dev          # next dev --turbopack
pnpm typecheck    # tsc --noEmit
pnpm lint         # eslint
```

**Dentro de `apps/mobile`:**
```bash
flutter pub get
flutter analyze
flutter run
```

---

## 7. Fluxo de desenvolvimento recomendado

1. `pnpm db:up` (uma vez, fica a correr em background)
2. Alterar o schema Prisma → `pnpm prisma:migrate --name <descrição>` dentro de `apps/api`
3. Implementar o endpoint no backend
4. Consumir o endpoint no `apps/web` e/ou `apps/mobile` através do cliente HTTP único de cada um
5. Atualizar `docs/context/PROJECT_CONTEXT.txt` no final de cada fase (estado dos módulos, decisões tomadas, problemas encontrados)

## 8. Padrão de Dashboards (Fase 7)

Os dashboards Cliente/Profissional seguem o mesmo princípio de "um único conceito, adaptado ao dispositivo": `DashboardShell` (sidebar/drawer) no website e `DashboardScaffold` (bottom navigation) no mobile expõem a mesma lista de secções, mas cada um usa o padrão de navegação nativo da sua plataforma — nunca se tenta forçar uma sidebar num ecrã de telemóvel. A lista de secções em si (`dashboard-nav.ts` no web) é a fonte da verdade do que existe; o mobile consolida secções menos usadas dentro do separador "Perfil" por limitação de espaço, mas aponta para o mesmo conjunto de funcionalidades.
