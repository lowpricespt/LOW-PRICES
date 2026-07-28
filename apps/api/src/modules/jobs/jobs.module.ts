import { Module } from '@nestjs/common';
import { RequestsModule } from '../requests/requests.module';
import { JobsController } from './jobs.controller';
import { JobsRepository } from './jobs.repository';
import { JobsService } from './jobs.service';

@Module({
  imports: [RequestsModule],
  controllers: [JobsController],
  providers: [JobsService, JobsRepository],
})
export class JobsModule {}
