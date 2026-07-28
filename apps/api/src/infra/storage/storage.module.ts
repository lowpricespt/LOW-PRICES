import { Module } from '@nestjs/common';
import { ImageProcessingService } from './image-processing.service';
import { OrphanCleanupService } from './orphan-cleanup.service';
import { R2StorageProvider } from './providers/r2-storage.provider';
import { StorageController } from './storage.controller';
import { STORAGE_PROVIDER } from './storage.constants';
import { StorageService } from './storage.service';

@Module({
  controllers: [StorageController],
  providers: [
    R2StorageProvider,
    { provide: STORAGE_PROVIDER, useExisting: R2StorageProvider },
    ImageProcessingService,
    OrphanCleanupService,
    StorageService,
  ],
  exports: [StorageService],
})
export class StorageModule {}
