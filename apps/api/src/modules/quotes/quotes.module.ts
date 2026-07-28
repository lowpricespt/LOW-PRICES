import { Module } from '@nestjs/common';
import { RequestsModule } from '../requests/requests.module';
import { QuotesController } from './quotes.controller';
import { QuotesRepository } from './quotes.repository';
import { QuotesService } from './quotes.service';

@Module({
  imports: [RequestsModule],
  controllers: [QuotesController],
  providers: [QuotesService, QuotesRepository],
})
export class QuotesModule {}
