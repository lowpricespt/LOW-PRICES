import { Module } from '@nestjs/common';
import { RequestsModule } from '../requests/requests.module';
import { AvailabilityController } from './availability.controller';
import { AvailabilityRepository } from './availability.repository';
import { AvailabilityService } from './availability.service';

@Module({
  imports: [RequestsModule],
  controllers: [AvailabilityController],
  providers: [AvailabilityService, AvailabilityRepository],
})
export class AvailabilityModule {}
