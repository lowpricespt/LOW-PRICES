import { IsBoolean, IsOptional } from 'class-validator';

export class UpdateNotificationPreferencesDto {
  @IsOptional()
  @IsBoolean()
  emailEnabled?: boolean;

  // Push e SMS ainda não têm nenhum canal de envio real ligado (ver
  // NOTIFICATIONS_ARCHITECTURE.md) — o campo existe no modelo e aceita-se
  // aqui para não bloquear quando esses canais forem ligados, mas o
  // frontend atual não expõe estes toggles como editáveis (evita "botão
  // que não faz nada").
  @IsOptional()
  @IsBoolean()
  pushEnabled?: boolean;

  @IsOptional()
  @IsBoolean()
  smsEnabled?: boolean;
}
