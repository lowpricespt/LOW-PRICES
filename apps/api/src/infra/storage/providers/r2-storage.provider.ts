import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import type { StorageProvider, UploadFileParams } from '../interfaces/storage-provider.interface';

/**
 * Cloudflare R2 expõe uma API compatível com S3 — por isso usamos o SDK
 * oficial da AWS, só apontado a um endpoint diferente. Isto significa
 * que, se algum dia quisermos migrar para outro provider S3-compatível
 * (ex.: Backblaze B2, DigitalOcean Spaces), a troca é só a
 * BaseOptions/endpoint, nunca a lógica de upload em si.
 *
 * Importante: as credenciais são lidas de forma opcional (get, não
 * getOrThrow) e o S3Client só é criado quando o storage é mesmo usado
 * pela primeira vez (lazy). Sem isto, a aplicação inteira falhava o
 * arranque sempre que o R2 ainda não estivesse configurado — mesmo que
 * nenhum utilizador estivesse a tentar fazer upload de nada. Enquanto o
 * R2 não estiver configurado, a app arranca normalmente e só os
 * pedidos de upload/eliminação falham, com um erro claro.
 */
@Injectable()
export class R2StorageProvider implements StorageProvider {
  readonly name = 'cloudflare-r2';

  private client: S3Client | null = null;
  private bucketName: string | null = null;
  private publicBaseUrl: string | null = null;

  constructor(private readonly configService: ConfigService) {}

  private getClient(): { client: S3Client; bucketName: string; publicBaseUrl: string } {
    if (this.client && this.bucketName && this.publicBaseUrl) {
      return { client: this.client, bucketName: this.bucketName, publicBaseUrl: this.publicBaseUrl };
    }

    const accountId = this.configService.get<string>('R2_ACCOUNT_ID');
    const bucketName = this.configService.get<string>('R2_BUCKET_NAME');
    const publicBaseUrl = this.configService.get<string>('R2_PUBLIC_BASE_URL');
    const accessKeyId = this.configService.get<string>('R2_ACCESS_KEY_ID');
    const secretAccessKey = this.configService.get<string>('R2_SECRET_ACCESS_KEY');

    if (!accountId || !bucketName || !publicBaseUrl || !accessKeyId || !secretAccessKey) {
      throw new ServiceUnavailableException(
        'O armazenamento de ficheiros (Cloudflare R2) ainda não está configurado no servidor.',
      );
    }

    this.bucketName = bucketName;
    this.publicBaseUrl = publicBaseUrl;
    this.client = new S3Client({
      region: 'auto',
      endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
      credentials: { accessKeyId, secretAccessKey },
    });

    return { client: this.client, bucketName: this.bucketName, publicBaseUrl: this.publicBaseUrl };
  }

  async upload(params: UploadFileParams): Promise<void> {
    const { client, bucketName } = this.getClient();
    await client.send(
      new PutObjectCommand({
        Bucket: bucketName,
        Key: params.key,
        Body: params.buffer,
        ContentType: params.contentType,
      }),
    );
  }

  async delete(key: string): Promise<void> {
    const { client, bucketName } = this.getClient();
    await client.send(new DeleteObjectCommand({ Bucket: bucketName, Key: key }));
  }

  async getSignedUrl(key: string, expiresInSeconds: number): Promise<string> {
    const { client, bucketName } = this.getClient();
    const command = new GetObjectCommand({ Bucket: bucketName, Key: key });
    return getSignedUrl(client, command, { expiresIn: expiresInSeconds });
  }

  getPublicUrl(key: string): string {
    const { publicBaseUrl } = this.getClient();
    return `${publicBaseUrl}/${key}`;
  }
}
