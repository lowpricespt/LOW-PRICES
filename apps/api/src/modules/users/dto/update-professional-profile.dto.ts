import { ArrayUnique, IsArray, IsIn, IsInt, IsLatitude, IsLongitude, IsOptional, IsString, Length, Max, Min } from 'class-validator';

const WEEKDAY_CODES = ['seg', 'ter', 'qua', 'qui', 'sex', 'sab', 'dom'] as const;

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

  @IsOptional()
  @IsString()
  @Length(0, 255)
  location?: string;

  @IsOptional()
  @IsLatitude()
  latitude?: number;

  @IsOptional()
  @IsLongitude()
  longitude?: number;

  @IsOptional()
  @IsArray()
  @ArrayUnique()
  @IsIn(WEEKDAY_CODES, { each: true })
  availableDays?: string[];
}
