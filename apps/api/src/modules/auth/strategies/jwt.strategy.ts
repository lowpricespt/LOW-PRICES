import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import type { AuthenticatedUser } from '../interfaces/authenticated-user.interface';
import type { JwtPayload } from '../interfaces/jwt-payload.interface';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(configService: ConfigService) {
    const secret = configService.get<string>('JWT_ACCESS_SECRET');
    if (!secret) {
      throw new Error('JWT_ACCESS_SECRET não está definido nas variáveis de ambiente.');
    }

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: secret,
    });
  }

  // Chamado automaticamente pelo Passport depois de verificar a
  // assinatura/expiração do token. O valor devolvido fica em req.user.
  validate(payload: JwtPayload): AuthenticatedUser {
    if (!payload.sub || !payload.sid) {
      throw new UnauthorizedException('Token inválido.');
    }
    return { userId: payload.sub, role: payload.role, sessionId: payload.sid };
  }
}
