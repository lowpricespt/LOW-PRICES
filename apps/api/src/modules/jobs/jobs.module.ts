import { Module } from '@nestjs/common';
import { RequestsModule } from '../requests/requests.module';
import { EmailModule } from '../../infra/email/email.module';
import { JobsController } from './jobs.controller';
import { JobsRepository } from './jobs.repository';
import { JobsService } from './jobs.service';

@Module({
  imports: [RequestsModule, EmailModule],
  controllers: [JobsController],
  providers: [JobsService, JobsRepository],
  exports: [JobsRepository],
})
export class JobsModule {}
