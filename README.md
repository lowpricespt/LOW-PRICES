# Low Prices — Monorepo

Plataforma que liga clientes a profissionais para pequenos serviços locais.

## Documentação

Toda a documentação está centralizada em `docs/`:

- `docs/architecture/00-FUNDACAO-TECNICA.md` — arquitetura original e roadmap completo
- `docs/architecture/MONOREPO_ARCHITECTURE.md` — organização das pastas, responsabilidades, convenções
- `docs/architecture/AUTHENTICATION_ARCHITECTURE.md` — fluxo completo de autenticação (JWT, refresh, guards)
- `docs/architecture/NOTIFICATIONS_ARCHITECTURE.md` — arquitetura do sistema de notificações
- `docs/business/BUSINESS_MODEL.md` — modelo de monetização recomendado para o MVP
- `docs/context/PROJECT_CONTEXT.txt` — memória viva do projeto, atualizada no final de cada fase

## Estrutura

```
apps/
├── api/      Backend NestJS (Auth completo — ver AUTHENTICATION_ARCHITECTURE.md)
├── web/      Website Next.js
└── mobile/   App Flutter
```

## Backend + Website

```bash
pnpm install
pnpm db:up            # sobe Postgres + Redis via Docker
cd apps/api && pnpm prisma:generate && pnpm prisma:migrate --name init && pnpm dev
cd apps/web && pnpm dev
```

## App Mobile

```bash
cd apps/mobile
flutter pub get
flutter run
```

Ver `apps/mobile/README.md` para detalhes (emulador Android vs. iOS Simulator vs. desktop).
