import { IsString, MinLength } from 'class-validator';
import { IsStrongPassword } from './password-field.decorator';

export class ChangePasswordDto {
  @IsString()
  @MinLength(1, { message: 'Introduz a tua palavra-passe atual.' })
  currentPassword!: string;

  @IsStrongPassword()
  newPassword!: string;
}
