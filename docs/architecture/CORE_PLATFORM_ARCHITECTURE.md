# Low Prices — Chat, Agenda, Avaliações e Preparação para IA

## 0. Ciclo de Vida de um Serviço (núcleo da plataforma — Fase 9)

Três modelos Prisma, cada um com o seu próprio estado — ver `apps/api/prisma/schema.prisma`:

```
ServiceRequest (o pedido)          Quote (uma proposta)         Job (o trabalho real)
──────────────────────             ─────────────────────        ─────────────────────
DRAFT          "Novo"
  │ (publish)
PUBLISHED      "Publicado" ───────▶ SENT        "Proposta enviada"
  │                                    │ (cliente vê) [ServiceRequestMatch.viewedAt]
  │                                    │ "Visualizado" — por profissional, não é
  │                                    │  estado global (ver nota abaixo)
IN_NEGOTIATION (≥1 Quote enviada)      │
  │                                 ACCEPTED     "Proposta aceite" ──▶ SCHEDULED
SCHEDULED ◀─────────────────────────────────────────────────────────────┤
  │                                                                  IN_PROGRESS "Em execução"
COMPLETED ◀───────────────────────────────────────────────────────── COMPLETED "Concluído"
  │ (tempo/arquivo manual)
ARCHIVED       "Arquivado"

CANCELLED pode acontecer a partir de DRAFT/PUBLISHED/IN_NEGOTIATION (cliente cancela
antes de aceitar) ou a partir de SCHEDULED (Job cancelado depois de aceite).
```

- **"Notificado" e "Visualizado"** não são estados do `ServiceRequest` — são **por profissional**, guardados em `ServiceRequestMatch.notifiedAt`/`viewedAt` (um pedido pode estar "só notificado" para o Profissional A e "visualizado" para o Profissional B ao mesmo tempo). Documentado assim de propósito: um enum global não conseguiria representar isto.
- **Transição `publish()`** (já implementada em `RequestsService.publish`) já identifica os profissionais elegíveis (categoria) e cria os `ServiceRequestMatch` — só falta ligar o envio real de notificações (Fase 11).
- **Cada estado está preparado para:**
  - **Website/Mobile:** `status` é uma string simples no DTO de resposta — os `Badge`/`AppBadge` já mapeiam estado → cor (ver `REQUEST_STATUS_BADGE_VARIANT` no website, replicável no mobile).
  - **Backend:** enums Prisma (`ServiceRequestStatus`, `QuoteStatus`, `JobStatus`) — nunca strings soltas fora do schema.
  - **Notificações:** cada transição relevante (`PUBLISHED`, `Quote.ACCEPTED`, `Job.COMPLETED`) é um ponto de disparo natural para o `NotificationChannelSender` (ver secção 4.1 do `NOTIFICATIONS_ARCHITECTURE.md`).
  - **Dashboard/Histórico:** os `StubSection`/`DashboardTabStub` das listagens (Fase 7) já sabem o formato exato que vão consumir — só trocar mock por API real.

---

## 1. Chat

### Modelo de dados (Prisma — a criar na Fase 11)
```prisma
model Conversation {
  id        String   @id @default(uuid())
  jobId     String?  // ligado a um Job quando existir (Fase 10)
  clientId  String
  professionalId String
  createdAt DateTime @default(now())
  messages  Message[]
}

model Message {
  id             String   @id @default(uuid())
  conversationId String
  senderId       String
  content        String?
  attachmentUrl  String?  // foto/documento (Cloudflare R2)
  location       Json?    // { lat, lng } — partilha de localização
  readAt         DateTime?
  createdAt      DateTime @default(now())
}
```

### Transporte: WebSockets (não polling)
- Backend: `@WebSocketGateway` do NestJS, um gateway por `Conversation` (namespace `/chat`), autenticado com o mesmo JWT do REST (handshake).
- Indicador de leitura: `readAt` atualizado quando o destinatário abre a conversa; emitido de volta ao remetente via evento `message:read`.
- Estado online: `presence` mantido em Redis (`SET user:{id}:online EX 30`, renovado a cada heartbeat do cliente) — não em Postgres, porque é efémero e de alta frequência.
- Escrita em tempo real ("a escrever..."): evento `typing:start`/`typing:stop`, nunca persistido, só retransmitido aos participantes da conversa.
- Fallback: se o WebSocket cair, mensagens continuam a poder ser enviadas via `POST /conversations/:id/messages` (REST) — o gateway é uma otimização de latência, nunca o único caminho.

### Anexos (fotos/documentos)
- Reutiliza o mesmo `ImageService` (mobile) / upload para R2 (website) já usados no wizard — não um mecanismo de upload novo.

### Website/Mobile — já preparado
- `NotificationChannelSender` (ver `NOTIFICATIONS_ARCHITECTURE.md`, secção 4.1) já prevê `WebSocketChannelSender` como canal de notificação — o Chat reutiliza a mesma infraestrutura, não uma paralela.

---

## 2. Agenda (Profissional)

### Modelo de dados (Prisma — a criar na Fase 8/10)
```prisma
model AvailabilityRule {
  id               String   @id @default(uuid())
  professionalId   String
  dayOfWeek        Int      // 0-6
  startTime        String   // "09:00"
  endTime          String   // "18:00"
}

model AvailabilityBlock {
  id             String   @id @default(uuid())
  professionalId String
  startDate      DateTime
  endDate        DateTime
  reason         String?  // "férias", "indisponível", etc.
}

model Booking {
  id             String   @id @default(uuid())
  jobId          String   // ligado ao Job aceite (Fase 10)
  professionalId String
  scheduledStart DateTime
  scheduledEnd   DateTime
  status         String   // "CONFIRMED" | "CANCELLED" | "COMPLETED"
}
```

- **`AvailabilityRule`** = disponibilidade recorrente semanal ("todas as segundas das 9h às 18h").
- **`AvailabilityBlock`** = exceções (férias, indisponibilidade pontual) — subtrai-se à disponibilidade recorrente.
- **`Booking`** = compromissos reais, sempre ligados a um `Job`.
- **Vista "Calendário"** (pedida no prompt) não é uma tabela à parte — é a mesma informação (`AvailabilityRule` + `AvailabilityBlock` + `Booking`) apresentada como grelha em vez de lista, motivo pelo qual não existe uma rota `/agenda/calendario` separada (ver `dashboard-nav.ts`).
- **Sincronização com Google Calendar (futuro):** ficaria isolada num `CalendarSyncService` que traduz `Booking` ↔ eventos do Google Calendar via OAuth2 — nenhum dos modelos acima muda quando isto for adicionado, só um serviço novo que os lê/escreve.

---

## 3. Avaliações

### Modelo de dados (Prisma — a criar na Fase 13)
```prisma
model Review {
  id          String   @id @default(uuid())
  jobId       String   @unique // uma avaliação por trabalho
  authorId    String   // quem avalia
  targetId    String   // quem é avaliado (cliente avalia profissional, e vice-versa)
  rating      Int      // 1-5
  comment     String?
  response    String?  // resposta do avaliado
  respondedAt DateTime?
  createdAt   DateTime @default(now())
}

model Report {
  id         String   @id @default(uuid())
  reviewId   String
  reporterId String
  reason     String
  status     String   @default("PENDING") // "PENDING" | "REVIEWED" | "DISMISSED"
  createdAt  DateTime @default(now())
}
```

- **Bidirecional desde o início** (`authorId`/`targetId` genéricos): cliente avalia profissional e profissional avalia cliente com o mesmo modelo — evita duplicar schema mais tarde se decidirmos ativar avaliações de clientes (comum em plataformas maduras, mesmo que o MVP só mostre publicamente as do profissional).
- **Resposta do profissional:** campos `response`/`respondedAt` na própria `Review`, não uma tabela separada — é 1 resposta por avaliação, não uma thread.
- **Denúncia/Moderação:** `Report` aponta para uma `Review`; moderação (Fase 15, Admin) só muda o `status`, nunca apaga a avaliação original — mantém histórico de auditoria.

---

## 4. Preparação para Inteligência Artificial

Nenhuma funcionalidade de IA está implementada. Todas as interfaces abaixo devolvem/aceitam a forma final esperada, mas ainda não têm modelo por trás — servem para que o resto do código (formulários, listagens) já possa ser escrito contra o contrato definitivo.

```typescript
// apps/api/src/modules/ai/interfaces/ai-services.interface.ts (a criar quando ativado)

interface RequestDescriptionEnhancer {
  /** Sugere uma descrição mais clara a partir do texto em bruto do cliente. */
  enhance(rawDescription: string, category: string): Promise<string>;
}

interface ProfileCopyImprover {
  /** Sugere melhorias à bio/descrição do perfil de um profissional. */
  suggestImprovements(currentBio: string): Promise<string[]>;
}

interface ProfessionalRecommender {
  /** Ordena profissionais elegíveis por probabilidade de aceitação/satisfação, além da distância. */
  rank(requestId: string, eligibleProfessionalIds: string[]): Promise<string[]>;
}

interface FraudDetector {
  /** Sinaliza um pedido/conta com risco elevado para revisão manual (nunca bloqueia sozinho). */
  assessRisk(entityType: 'REQUEST' | 'USER', entityId: string): Promise<{ riskScore: number; reasons: string[] }>;
}

interface SmartSuggestions {
  /** Sugestões contextuais (ex.: "profissionais também pedem para trazer X"). */
  suggest(context: Record<string, unknown>): Promise<string[]>;
}
```

- **Decisão de arquitetura:** todas as interfaces são **opcionais e não bloqueantes** — se o serviço de IA falhar ou não estiver ativo, o fluxo principal (publicar pedido, ver perfil) continua a funcionar sem a sugestão. Nenhuma feature deve depender de uma resposta de IA para completar uma ação.
- **`FraudDetector` nunca decide sozinho:** só atribui um `riskScore` para revisão humana (Admin) — evita banir/bloquear automaticamente com base num modelo ainda não validado em produção.
- Quando ativadas, cada implementação é injetada via o mesmo padrão de Dependency Injection já usado em todo o projeto (Provider no NestJS, `Provider` no Riverpod do mobile, hook no website) — não um mecanismo novo.
