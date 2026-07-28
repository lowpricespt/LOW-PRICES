# Low Prices — Arquitetura de Cloud Storage (Fase 12, ainda não implementada)

## Decisão: Cloudflare R2, um único `StorageService`

Todos os tipos de ficheiro (fotos de perfil, certificados, documentos, imagens de pedidos, anexos de chat, comprovativos) passam pelo **mesmo** serviço — nunca um serviço por tipo de ficheiro, que levaria a lógica de upload/validação duplicada.

```typescript
// apps/api/src/infra/storage/storage.service.ts (a criar na Fase 12)

interface UploadResult {
  key: string;      // caminho no bucket
  url: string;       // URL pública (ou assinada, se privado)
}

interface StorageService {
  upload(params: {
    buffer: Buffer;
    fileName: string;
    contentType: string;
    folder: 'avatars' | 'documents' | 'certificates' | 'request-photos' | 'chat-attachments' | 'portfolio';
    isPublic: boolean; // documentos de identidade nunca são públicos
  }): Promise<UploadResult>;

  getSignedUrl(key: string, expiresInSeconds: number): Promise<string>;

  delete(key: string): Promise<void>;
}
```

- **`isPublic` decide o URL final:** avatares/fotos de pedidos/portefólio são públicos (URL direto do R2); documentos de identidade e certificados exigem `getSignedUrl` com expiração curta — só o próprio utilizador e o Admin (moderação) conseguem gerar o link.
- **Todos os campos que hoje têm `String?` a apontar para uma URL** (`ClientProfile.avatarUrl`, `ProfessionalProfile.avatarUrl`, `Document.fileUrl`, `PortfolioItem.imageUrl`, `ServiceRequest.photoUrls`) já estão no schema (Fase 8/9) — a Fase 12 só passa a preencher esses campos com o `key`/`url` real devolvido pelo `upload()`, em vez de ficarem `null`.
- **Mobile:** `ImageService` (já existe como contrato desde a Fase 4) ganha a implementação real (`image_picker` para selecionar, `dio` para enviar ao endpoint de upload do backend) — a assinatura não muda.
- **Website:** upload via `<input type="file">` + `FormData` para um endpoint `POST /storage/upload` (multipart), nunca diretamente do browser para o R2 (evita expor credenciais do bucket ao cliente).
- **Limites a validar no backend** (não implementado ainda, documentado para quando for): tamanho máximo por tipo (ex.: 5MB para fotos, 10MB para documentos), `contentType` na lista branca (`image/jpeg`, `image/png`, `application/pdf`).
