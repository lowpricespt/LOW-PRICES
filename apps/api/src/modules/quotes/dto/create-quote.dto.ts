import { IsISO8601, IsNumber, IsOptional, IsString, IsUUID, Length, Min } from 'class-validator';

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

  /// Opcional — ver comentário em schema.prisma sobre Quote.proposedStart.
  @IsOptional()
  @IsISO8601()
  proposedStart?: string;

  @IsOptional()
  @IsISO8601()
  proposedEnd?: string;
}
