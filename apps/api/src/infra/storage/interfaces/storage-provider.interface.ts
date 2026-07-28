export interface UploadFileParams {
  buffer: Buffer;
  key: string;
  contentType: string;
}

export interface StorageProvider {
  readonly name: string;

  upload(params: UploadFileParams): Promise<void>;

  delete(key: string): Promise<void>;

  /** Devolve um URL temporário para ficheiros privados (documentos/certificados). */
  getSignedUrl(key: string, expiresInSeconds: number): Promise<string>;

  /** URL direto para ficheiros públicos (avatares, fotos de pedidos, portefólio). */
  getPublicUrl(key: string): string;
}
