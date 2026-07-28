import { applyDecorators } from '@nestjs/common';
import { IsString, Length, Matches } from 'class-validator';

/// Regra única da força de password, partilhada por Registo, Reset e
/// Alterar Password — nunca duplicar esta regex noutro DTO.
export const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/;

export function IsStrongPassword() {
  return applyDecorators(
    IsString(),
    Length(8, 72, { message: 'A palavra-passe deve ter entre 8 e 72 caracteres.' }),
    Matches(PASSWORD_REGEX, {
      message: 'A palavra-passe deve conter maiúsculas, minúsculas e pelo menos um número.',
    }),
  );
}
