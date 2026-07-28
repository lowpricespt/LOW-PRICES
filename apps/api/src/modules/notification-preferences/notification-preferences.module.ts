import { Module } from '@nestjs/common';
import { RequestsModule } from '../requests/requests.module';
import { NotificationPreferencesController } from './notification-preferences.controller';
import { NotificationPreferencesRepository } from './notification-preferences.repository';
import { NotificationPreferencesService } from './notification-preferences.service';

@Module({
  imports: [RequestsModule],
  controllers: [NotificationPreferencesController],
  providers: [NotificationPreferencesService, NotificationPreferencesRepository],
})
export class NotificationPreferencesModule {}
