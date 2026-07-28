import { Injectable, type ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/**
 * Extensão do AuthGuard('google') que passa a intenção de registo
 * (CLIENT vs PROFESSIONAL) através do parâmetro `state` do OAuth2 — a
 * Google devolve este valor tal e qual no callback (`req.query.state`),
 * é o mecanismo standard para "levar dados através" do ecrã de
 * consentimento sem sessão nem cookies extra.
 *
 * Uso: GET /auth/google?role=PROFESSIONAL (botão do registo de
 * profissional) vs GET /auth/google (botão normal, assume CLIENT).
 */
@Injectable()
export class GoogleAuthGuard extends AuthGuard('google') {
  getAuthenticateOptions(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();
    const role = request.query?.role === 'PROFESSIONAL' ? 'PROFESSIONAL' : 'CLIENT';
    return { state: role };
  }
}
