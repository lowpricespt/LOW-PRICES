import { IsEmail, IsIn, IsString, Length, Matches } from 'class-validator';

const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/;

export class RegisterDto {
  @IsString()
  @Length(2, 100, { message: 'O nome deve ter entre 2 e 100 caracteres.' })
  name!: string;

  @IsEmail({}, { message: 'Introduz um email válido.' })
  email!: string;

  @IsString()
  @Length(8, 72, { message: 'A palavra-passe deve ter entre 8 e 72 caracteres.' })
  @Matches(PASSWORD_REGEX, {
    message: 'A palavra-passe deve conter maiúsculas, minúsculas e pelo menos um número.',
  })
  password!: string;

  @IsIn(['CLIENT', 'PROFESSIONAL'], { message: 'O perfil tem de ser CLIENT ou PROFESSIONAL.' })
  role!: 'CLIENT' | 'PROFESSIONAL';
}
