import { IsNumber, IsOptional, IsString, IsUUID, Length, Min } from 'class-validator';

export class CreateQuoteDto {
  @IsUUID()
  serviceRequestId!: string;

  @IsNumber()
  @Min(1)
  price!: number;

  @IsOptional()
  @IsString()
  @Length(0, 1000)
  message?: string;
}
