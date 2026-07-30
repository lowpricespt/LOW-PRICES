import { IsIn, IsOptional, IsString } from 'class-validator';

export class GoogleMobileLoginDto {
  @IsString()
  idToken!: string;

  @IsOptional()
  @IsIn(['CLIENT', 'PROFESSIONAL'])
  role?: 'CLIENT' | 'PROFESSIONAL';
}
