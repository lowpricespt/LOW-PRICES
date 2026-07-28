import { IsBoolean, IsLatitude, IsLongitude, IsOptional, IsString, Length } from 'class-validator';

export class UpsertAddressDto {
  @IsString()
  @Length(1, 60)
  label!: string;

  @IsString()
  @Length(1, 200)
  line1!: string;

  @IsOptional()
  @IsString()
  @Length(0, 200)
  line2?: string;

  @IsString()
  @Length(1, 20)
  postalCode!: string;

  @IsString()
  @Length(1, 100)
  city!: string;

  @IsOptional()
  @IsLatitude()
  latitude?: number;

  @IsOptional()
  @IsLongitude()
  longitude?: number;

  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;
}
