import { IsOptional, IsString, IsUrl, Length, Matches } from 'class-validator';

export class UpdateProfileDto {
  @IsOptional()
  @IsString()
  @Length(2, 100)
  name?: string;

  @IsOptional()
  @Matches(/^\+?[0-9\s]{9,15}$/, { message: 'Número de telefone inválido.' })
  phone?: string;

  @IsOptional()
  @IsUrl({}, { message: 'avatarUrl tem de ser um URL válido.' })
  avatarUrl?: string;
}
