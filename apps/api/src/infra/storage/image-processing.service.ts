import { Injectable } from '@nestjs/common';
import sharp from 'sharp';

export interface ProcessedImage {
  original: Buffer;
  thumbnail: Buffer;
  contentType: 'image/webp';
}

const THUMBNAIL_SIZE = 256;
const MAX_DIMENSION = 2000;
const WEBP_QUALITY = 82;

@Injectable()
export class ImageProcessingService {
  /**
   * Comprime a imagem original (redimensiona se exceder MAX_DIMENSION,
   * converte para WebP) e gera uma thumbnail quadrada. WebP em vez de
   * manter o formato original: ~30% mais pequeno que JPEG à mesma
   * qualidade percebida, e todos os browsers/plataformas alvo já o
   * suportam nativamente (Next.js `next/image` também).
   */
  async process(buffer: Buffer): Promise<ProcessedImage> {
    const image = sharp(buffer).rotate(); // rotate() sem args = corrige a orientação EXIF automaticamente

    const original = await image
      .clone()
      .resize({ width: MAX_DIMENSION, height: MAX_DIMENSION, fit: 'inside', withoutEnlargement: true })
      .webp({ quality: WEBP_QUALITY })
      .toBuffer();

    const thumbnail = await image
      .clone()
      .resize({ width: THUMBNAIL_SIZE, height: THUMBNAIL_SIZE, fit: 'cover' })
      .webp({ quality: WEBP_QUALITY })
      .toBuffer();

    return { original, thumbnail, contentType: 'image/webp' };
  }
}
