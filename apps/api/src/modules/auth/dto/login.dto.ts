import { IsEmail, IsString, MinLength } from 'class-validator';

export class LoginDto {
  @IsEmail({}, { message: 'Introduz um email válido.' })
  email!: string;

  @IsString()
  @MinLength(1, { message: 'A palavra-passe é obrigatória.' })
  password!: string;
}
