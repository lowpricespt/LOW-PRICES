import { IsDateString, IsOptional, IsString, Length } from 'class-validator';

export class CreateAvailabilityBlockDto {
  @IsDateString()
  startDate!: string;

  @IsDateString()
  endDate!: string;

  @IsOptional()
  @IsString()
  @Length(0, 200)
  reason?: string;
}
