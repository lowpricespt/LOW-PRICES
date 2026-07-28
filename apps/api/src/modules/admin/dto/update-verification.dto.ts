import { IsIn, IsOptional, IsString, Length } from 'class-validator';

export class UpdateVerificationDto {
  @IsIn(['APPROVED', 'REJECTED'], { message: 'O estado tem de ser APPROVED ou REJECTED.' })
  status!: 'APPROVED' | 'REJECTED';

  /// Motivo da rejeição — não guardado em coluna própria ainda (schema
  /// não tem esse campo), mas registado no AuditLog para haver rasto de
  /// porque um profissional foi rejeitado.
  @IsOptional()
  @IsString()
  @Length(0, 500)
  reason?: string;
}
