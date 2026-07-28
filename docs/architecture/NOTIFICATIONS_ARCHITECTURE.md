# Low Prices — Arquitetura do Sistema de Notificações

**Estado:** arquitetura documentada e parcialmente estruturada em código (contratos `NotificationService` no mobile). Implementação real do Firebase e da lógica de matching fica para a fase de Backend + Notificações.

---

## 1. Visão geral do fluxo

Quando um **Cliente publica um pedido de serviço**, a plataforma deve identificar automaticamente todos os profissionais elegíveis e notificá-los, sem intervenção manual.

```
Cliente publica pedido
        │
        ▼
┌───────────────────────┐
│ 1. Identificar         │  categoria do ServiceRequest (já vem do formulário)
│    categoria           │
└──────────┬────────────┘
           ▼
┌───────────────────────┐
│ 2. Query: profissionais│  WHERE category = X AND verificationStatus = 'APPROVED'
│    ativos da categoria │  AND status = 'ACTIVE'
└──────────┬────────────┘
           ▼
┌───────────────────────┐
│ 3. Filtrar por         │  distância entre localização do pedido e
│    localização         │  localização base de cada profissional (PostGIS)
└──────────┬────────────┘
           ▼
┌───────────────────────┐
│ 4. Filtrar por raio    │  distância <= professional.serviceRadiusKm
│    de atuação          │
└──────────┬────────────┘
           ▼
┌───────────────────────┐
│ 5. Enviar Push (FCM)   │  para cada profissional elegível, em paralelo
└──────────┬────────────┘
           ▼
┌───────────────────────┐
│ 6. Criar notificação   │  registo persistente em BD (para o profissional
│    interna              │  ver na campainha/lista mesmo sem push)
└──────────┬────────────┘
           ▼
┌───────────────────────┐
│ 7. Guardar histórico   │  NotificationLog: quem, quando, canal, estado
└──────────┬────────────┘
           ▼
┌───────────────────────┐
│ 8. Retry em falhas     │  fila com backoff exponencial para envios falhados
└───────────────────────┘
```

---

## 2. Componentes envolvidos (Backend NestJS)

| Componente | Responsabilidade |
|---|---|
| `RequestPublishedEvent` | Evento de domínio emitido quando um `ServiceRequest` passa a `PUBLISHED` |
| `NotificationMatchingService` | Passos 2–4: encontra profissionais elegíveis (query Prisma + PostGIS) |
| `PushNotificationService` | Passo 5: envia via Firebase Admin SDK (`sendMulticast`) |
| `NotificationRepository` | Passos 6–7: persiste notificação interna + entrada no log |
| `NotificationRetryQueue` | Passo 8: fila (BullMQ sobre Redis — já temos Redis na Fase 1) para reprocessar falhas |

**Porquê um evento de domínio e não uma chamada direta no controller de `ServiceRequest`:**
Desacopla a criação do pedido do envio de notificações — se o serviço de notificações estiver em baixo, o pedido continua a ser criado com sucesso; o evento fica em fila e é reprocessado. Isto é o padrão usado por Uber/Airbnb para qualquer efeito secundário não crítico ao caminho principal.

---

## 3. Modelo de dados (Prisma — a acrescentar ao schema)

```prisma
model Notification {
  id        String   @id @default(uuid())
  userId    String              // profissional (ou cliente, para outras notificações)
  type      String              // "NEW_SERVICE_REQUEST", "QUOTE_RECEIVED", etc.
  title     String
  body      String
  payload   Json?               // ex.: { requestId: "..." } para deep-link
  readAt    DateTime?
  createdAt DateTime @default(now())
}

model NotificationLog {
  id             String   @id @default(uuid())
  notificationId String
  channel        String   // "PUSH" | "INTERNAL"
  status         String   // "SENT" | "FAILED" | "RETRYING"
  attempts       Int      @default(0)
  lastError      String?
  createdAt      DateTime @default(now())
}
```

---

## 4. Estratégia de retry

- Fila dedicada (`notifications` queue, BullMQ + Redis).
- Backoff exponencial: 1ª retry aos 30s, 2ª aos 2min, 3ª aos 10min. Depois de 3 falhas, marca como `FAILED` definitivo e fica visível num painel de erros do Admin (Fase de Administração).
- Tokens FCM inválidos (dispositivo desinstalou a app) são removidos automaticamente da tabela de dispositivos do profissional, para não se tentar reenviar para sempre.

---

## 4.1 Canais adicionais (Email, SMS, WebSocket) — arquitetura preparada

O Passo 5 do fluxo (secção 1) generaliza-se para múltiplos canais, cada um com o seu `NotificationChannelSender` a implementar a mesma interface:

```typescript
interface NotificationChannelSender {
  send(notification: NotificationPayload): Promise<void>;
}

class PushChannelSender implements NotificationChannelSender { /* Firebase Admin SDK */ }
class EmailChannelSender implements NotificationChannelSender { /* Resend/SendGrid — por escolher */ }
class SmsChannelSender implements NotificationChannelSender { /* Twilio/Vonage — por escolher */ }
class WebSocketChannelSender implements NotificationChannelSender { /* Gateway NestJS (@WebSocketGateway) */ }
```

`NotificationLog.channel` já guarda qual canal foi usado em cada envio (campo `string`, ver secção 3) — só falta decidir, por tipo de notificação, quais canais disparar (ex.: "novo pedido" → Push + Interna; "pagamento recebido" → Push + Email).

**WebSocket em tempo real:** para o Chat (Fase 11) e para atualizações ao vivo do estado de um pedido, o mesmo `@WebSocketGateway` do NestJS pode ser reutilizado como mais um `NotificationChannelSender` — envia para o socket do utilizador se estiver ligado, e cai para Push se não estiver (mesmo padrão de fallback do Slack/Discord).

**Ainda não implementado (arquitetura apenas):** nenhum `ChannelSender` tem código real ainda — só a interface e a decisão de que cada canal é intercambiável sem tocar no `NotificationMatchingService` (que continua a decidir *quem* notificar, independentemente de *como*).

---

## 4.2 Agendamento, preferências e reenvio automático

- **Preferências do utilizador:** `NotificationPreference` (Prisma, adicionado na Fase 8 — ver `apps/api/prisma/schema.prisma`) guarda `pushEnabled`/`emailEnabled`/`smsEnabled` por Cliente/Profissional. O `NotificationMatchingService` (secção 2) consulta esta tabela antes de escolher os `ChannelSender` a acionar — nunca envia por um canal que o utilizador desligou.
- **Agendamento (envio diferido):** para lembretes (ex.: "o teu trabalho é amanhã"), a mesma fila BullMQ suporta `delay` — não é um mecanismo novo, é um parâmetro da task já prevista na estratégia de retry (secção 4).
- **Reenvio automático:** distinto do retry por falha técnica (secção 4) — este é reenvio por falta de interação (ex.: "ainda não viste este orçamento" 24h depois). Implementa-se como uma segunda entrada agendada na mesma fila, cancelada automaticamente se o `ServiceRequestMatch.viewedAt` for preenchido entretanto.

---



`lib/services/notification_service.dart` define o contrato (`requestPermission`, `getDeviceToken`, `onMessageReceived`). Quando o Firebase for ativado:

1. Criar o projeto no Firebase Console.
2. `flutterfire configure` (gera `firebase_options.dart`).
3. Adicionar `firebase_messaging` ao `pubspec.yaml`.
4. Implementar `FirebaseNotificationService implements NotificationService`.
5. Registar o `getDeviceToken()` no backend assim que o utilizador autenticar (associa token FCM ↔ userId).
6. Trocar o provider em `app_providers.dart` — nenhum outro ficheiro muda.

---

## 6. Notas de escala

- A query do Passo 2–4 deve ter índice composto em `(category, status, verificationStatus)` e um índice espacial (GiST via PostGIS) na coluna de localização — sem isto, a query degrada linearmente com o número de profissionais.
- Para milhões de utilizadores, o `sendMulticast` do FCM tem um limite de 500 tokens por chamada — para categorias muito populares numa cidade grande, dividir em lotes de 500.
- Esta arquitetura assume volume moderado (milhares de pedidos/dia). Se o volume crescer muito, o próximo passo natural é mover o matching para um índice de geolocalização dedicado (ex.: Redis Geo ou Elasticsearch) — não é necessário agora, seria overengineering para o MVP.
