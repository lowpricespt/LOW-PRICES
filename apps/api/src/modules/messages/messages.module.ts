import { Module } from '@nestjs/common';
import { JobsModule } from '../jobs/jobs.module';
import { RequestsModule } from '../requests/requests.module';
import { EmailModule } from '../../infra/email/email.module';
import { MessagesController } from './messages.controller';
import { MessagesRepository } from './messages.repository';
import { MessagesService } from './messages.service';

@Module({
  imports: [JobsModule, RequestsModule, EmailModule],
  controllers: [MessagesController],
  providers: [MessagesService, MessagesRepository],
})
export class MessagesModule {}
