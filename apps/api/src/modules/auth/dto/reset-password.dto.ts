import { IsString } from 'class-validator';
import { IsStrongPassword } from './password-field.decorator';

export class ResetPasswordDto {
  @IsString()
  token!: string;

  @IsStrongPassword()
  newPassword!: string;
}
