import { IsEmail, IsIn, IsString, Length } from 'class-validator';
import { IsStrongPassword } from './password-field.decorator';

export class RegisterDto {
  @IsString()
  @Length(2, 100, { message: 'O nome deve ter entre 2 e 100 caracteres.' })
  name!: string;

  @IsEmail({}, { message: 'Introduz um email válido.' })
  email!: string;

  @IsStrongPassword()
  password!: string;

  @IsIn(['CLIENT', 'PROFESSIONAL'], { message: 'O perfil tem de ser CLIENT ou PROFESSIONAL.' })
  role!: 'CLIENT' | 'PROFESSIONAL';
}
