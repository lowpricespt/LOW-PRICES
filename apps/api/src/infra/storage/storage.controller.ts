import {
  BadRequestException,
  Controller,
  Delete,
  ForbiddenException,
  Param,
  Post,
  Query,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import type { Express } from 'express';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { AuthenticatedUser } from '../../modules/auth/interfaces/authenticated-user.interface';
import { StorageService, type UploadFolder } from './storage.service';

const VALID_FOLDERS: UploadFolder[] = [
  'avatars',
  'covers',
  'documents',
  'certificates',
  'request-photos',
  'chat-attachments',
  'portfolio',
];

@Controller('storage')
export class StorageController {
  constructor(private readonly storageService: StorageService) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async upload(
    @CurrentUser() user: AuthenticatedUser,
    @UploadedFile() file: Express.Multer.File,
    @Query('folder') folder: string,
  ) {
    if (!file) throw new BadRequestException('Nenhum ficheiro enviado.');
    if (!VALID_FOLDERS.includes(folder as UploadFolder)) {
      throw new BadRequestException(`Pasta inválida. Válidas: ${VALID_FOLDERS.join(', ')}.`);
    }

    return this.storageService.uploadFile({
      buffer: file.buffer,
      originalFileName: file.originalname,
      contentType: file.mimetype,
      folder: folder as UploadFolder,
      ownerId: user.userId,
    });
  }

  @Delete(':key')
  async delete(@CurrentUser() user: AuthenticatedUser, @Param('key') key: string) {
    const decodedKey = decodeURIComponent(key);
    // O key inclui sempre o ownerId no caminho ({folder}/{ownerId}/...) —
    // confirmar isto aqui é barato e evita que um utilizador apague
    // ficheiros de outro só por adivinhar/copiar o key.
    if (!decodedKey.includes(`/${user.userId}/`)) {
      throw new ForbiddenException('Não tens permissão para eliminar este ficheiro.');
    }
    await this.storageService.deleteFile(decodedKey);
    return { deleted: true };
  }
}
