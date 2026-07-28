import { Module } from '@nestjs/common';
import { MatchingModule } from '../matching/matching.module';
import { RequestsController } from './requests.controller';
import { RequestsRepository } from './requests.repository';
import { RequestsService } from './requests.service';

@Module({
  imports: [MatchingModule],
  controllers: [RequestsController],
  providers: [RequestsService, RequestsRepository],
  exports: [RequestsRepository, RequestsService],
})
export class RequestsModule {}
