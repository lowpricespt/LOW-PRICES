import { IsString, Length, Matches } from 'class-validator';

const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/;

export class ResetPasswordDto {
  @IsString()
  token!: string;

  @IsString()
  @Length(8, 72, { message: 'A palavra-passe deve ter entre 8 e 72 caracteres.' })
  @Matches(PASSWORD_REGEX, {
    message: 'A palavra-passe deve conter maiúsculas, minúsculas e pelo menos um número.',
  })
  newPassword!: string;
}
