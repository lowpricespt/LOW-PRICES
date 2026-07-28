# Low Prices — Arquitetura de Upload / Cloud Storage

## Estado: IMPLEMENTADO (backend) — não testado contra R2 real (sem rede/credenciais neste ambiente)

Ver também `STORAGE_ARCHITECTURE.md` (desenho original, Fase 8+9) — este documento descreve o que foi efetivamente construído na Fase 8c.

## Backend

```
StorageController (POST /storage/upload, DELETE /storage/:key)
        |
        v
StorageService (validação, decide pasta pública/privada, orquestra)
        |
   +----+----+
   v         v
ImageProcessingService   StorageProvider (interface)
(Sharp: resize + WebP        |
 + thumbnail 256x256)        v
                        R2StorageProvider (AWS S3 SDK -> endpoint R2)
```

- **`StorageProvider` é uma interface** — `R2StorageProvider` é a única implementação hoje, mas trocar para outro provider S3-compatível é escrever uma nova classe e mudar 1 linha em `storage.module.ts`.
- **Validação:** tipo de ficheiro (`image/jpeg`, `image/png`, `image/webp`, `application/pdf`) e tamanho (máx. 10MB) — rejeitados com `400 Bad Request` antes de gastar tempo/dinheiro a processar ou enviar ao R2.
- **Imagens são sempre convertidas para WebP** (original redimensionado até 2000px + thumbnail 256x256 quadrada) — ficheiros não-imagem (documentos PDF) passam sem alteração.
- **URLs públicas vs. assinadas:** `avatars`/`covers`/`request-photos`/`portfolio`/`chat-attachments` -> público (URL direto). `documents`/`certificates` -> assinado, expira em 1h (`getSignedUrl`).
- **Segurança:** o `key` de cada ficheiro inclui sempre `{folder}/{ownerId}/...` — o `DELETE` confirma que o `ownerId` no key corresponde ao utilizador autenticado antes de apagar.
- **Limpeza de ficheiros órfãos:** `OrphanCleanupService` existe como esqueleto (cron diário às 3h) mas **a lógica de deteção real não está implementada** — ver comentário no próprio ficheiro para as duas abordagens possíveis (comparar bucket vs. BD, ou tabela `FileReference` dedicada).

## Website

- `AvatarUpload` (design system, `components/ui/avatar-upload.tsx`): preview instantâneo (via `URL.createObjectURL`, antes do upload terminar), barra de progresso real (`axios` `onUploadProgress`), erro com botão de retry, usa `next/image` (evita CLS).
- **Ligado de ponta a ponta:** avatar do Perfil Cliente — upload -> grava automaticamente em `ClientProfile.avatarUrl` via `PATCH /users/me` (sem precisar de clicar "Guardar alterações" à parte).
- **Ainda não ligado:** foto de capa, documentos, certificados, portefólio, foto de pedidos — o componente `AvatarUpload` e o `uploadFile()` (`services/api/upload-api.ts`) já servem para todos estes casos (só muda o `folder`), falta construir os formulários que os usam.

## Mobile

**Não alterado nesta fase.** `ImageService` continua stub (`StubImageService`) — a implementação real (`image_picker` + `dio` a chamar `POST /storage/upload`) fica para quando o Perfil do Especialista for construído no Flutter, para não implementar upload duas vezes com padrões ligeiramente diferentes.

## Compressão/thumbnails: decisão de arquitetura

Processamento feito **no backend** (Sharp), não no cliente — motivo: garante qualidade/tamanho consistentes independentemente da plataforma (web/iOS/Android têm bibliotecas de compressão diferentes, com resultados diferentes), e evita confiar no cliente para gerar um ficheiro dentro dos limites aceites pelo servidor.
