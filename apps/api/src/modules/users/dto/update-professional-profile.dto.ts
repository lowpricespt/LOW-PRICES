import { IsInt, IsOptional, IsString, Length, Max, Min } from 'class-validator';

export class UpdateProfessionalProfileDto {
  @IsOptional()
  @IsString()
  @Length(0, 1000)
  bio?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(150)
  serviceRadiusKm?: number;
}
