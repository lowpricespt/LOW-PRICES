import { IsArray, IsIn, IsNumber, IsOptional, IsString, IsUUID, Length, Min } from 'class-validator';

const URGENCY_VALUES = ['hoje', 'esta-semana', 'este-mes', 'sem-urgencia'] as const;

export class CreateServiceRequestDto {
  @IsUUID()
  categoryId!: string;

  @IsString()
  @Length(10, 2000, { message: 'A descrição deve ter entre 10 e 2000 caracteres.' })
  description!: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  photoUrls?: string[];

  @IsString()
  @Length(3, 200)
  location!: string;

  @IsOptional()
  @IsNumber()
  latitude?: number;

  @IsOptional()
  @IsNumber()
  longitude?: number;

  @IsIn(URGENCY_VALUES, { message: 'Urgência inválida.' })
  urgency!: (typeof URGENCY_VALUES)[number];

  @IsOptional()
  @IsNumber()
  @Min(0)
  budget?: number;
}
