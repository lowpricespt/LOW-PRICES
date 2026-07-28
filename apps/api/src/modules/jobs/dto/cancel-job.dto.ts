import { IsOptional, IsString, Length } from 'class-validator';

export class CancelJobDto {
  @IsOptional()
  @IsString()
  @Length(0, 500)
  reason?: string;
}
