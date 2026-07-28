import { IsEmail, IsString, MinLength } from 'class-validator';

export class ChangeEmailDto {
  @IsEmail({}, { message: 'Introduz um email válido.' })
  newEmail!: string;

  @IsString()
  @MinLength(1, { message: 'Confirma a tua palavra-passe atual para continuar.' })
  currentPassword!: string;
}
