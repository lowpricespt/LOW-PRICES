import { Module } from '@nestjs/common';
import { RequestsModule } from '../requests/requests.module';
import { StorageModule } from '../../infra/storage/storage.module';
import { DocumentsController } from './documents.controller';
import { DocumentsService } from './documents.service';
import { DocumentsRepository } from './documents.repository';

@Module({
  imports: [RequestsModule, StorageModule],
  controllers: [DocumentsController],
  providers: [DocumentsService, DocumentsRepository],
})
export class DocumentsModule {}
