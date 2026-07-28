import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { randomBytes, createHash } from 'node:crypto';
import type { UserRole } from '@prisma/client';
import type { JwtPayload } from '../interfaces/jwt-payload.interface';

@Injectable()
export class TokenService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  signAccessToken(params: { userId: string; role: UserRole; sessionId: string }): string {
    const payload: JwtPayload = { sub: params.userId, role: params.role, sid: params.sessionId };
    return this.jwtService.sign(payload, {
      secret: this.configService.get<string>('JWT_ACCESS_SECRET'),
      expiresIn: this.configService.get<string>('JWT_ACCESS_EXPIRES_IN') ?? '15m',
    });
  }

  /**
   * Gera um refresh token opaco (não é um JWT) — 256 bits de entropia,
   * imprevisível e sem informação codificada dentro dele. É devolvido em
   * texto simples ao cliente UMA VEZ; só o hash SHA-256 fica em BD.
   */
  generateRefreshToken(): { raw: string; hash: string } {
    const raw = randomBytes(32).toString('hex');
    return { raw, hash: this.hashRefreshToken(raw) };
  }

  hashRefreshToken(raw: string): string {
    return createHash('sha256').update(raw).digest('hex');
  }

  /**
   * Mesma forma do refresh token (opaco, 256 bits, só o hash em BD) —
   * usado para o link de recuperação de password.
   */
  generatePasswordResetToken(): { raw: string; hash: string } {
    const raw = randomBytes(32).toString('hex');
    return { raw, hash: createHash('sha256').update(raw).digest('hex') };
  }

  getRefreshTokenTtlMs(): number {
    const value = this.configService.get<string>('JWT_REFRESH_EXPIRES_IN') ?? '30d';
    return this.parseDurationToMs(value);
  }

  private parseDurationToMs(value: string): number {
    const match = /^(\d+)([smhd])$/.exec(value.trim());
    if (!match) return 30 * 24 * 60 * 60 * 1000; // fallback: 30 dias

    const amount = Number(match[1]);
    const unit = match[2];
    const unitMs = { s: 1000, m: 60_000, h: 3_600_000, d: 86_400_000 }[unit] ?? 86_400_000;
    return amount * unitMs;
  }
}
