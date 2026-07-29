import { IsDateString } from 'class-validator';

export class ScheduleJobDto {
  @IsDateString()
  scheduledStart!: string;

  @IsDateString()
  scheduledEnd!: string;
}
