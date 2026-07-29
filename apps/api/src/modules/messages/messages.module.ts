import { Module } from '@nestjs/common';
import { QuotesModule } from '../quotes/quotes.module';
import { RequestsModule } from '../requests/requests.module';
import { EmailModule } from '../../infra/email/email.module';
import { MessagesController } from './messages.controller';
import { MessagesRepository } from './messages.repository';
import { MessagesService } from './messages.service';

@Module({
  imports: [QuotesModule, RequestsModule, EmailModule],
  controllers: [MessagesController],
  providers: [MessagesService, MessagesRepository],
})
export class MessagesModule {}
