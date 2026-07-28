import { Module } from '@nestjs/common';
import { JobsModule } from '../jobs/jobs.module';
import { RequestsModule } from '../requests/requests.module';
import { EmailModule } from '../../infra/email/email.module';
import { ReviewsController } from './reviews.controller';
import { ReviewsRepository } from './reviews.repository';
import { ReviewsService } from './reviews.service';

@Module({
  imports: [JobsModule, RequestsModule, EmailModule],
  controllers: [ReviewsController],
  providers: [ReviewsService, ReviewsRepository],
})
export class ReviewsModule {}
