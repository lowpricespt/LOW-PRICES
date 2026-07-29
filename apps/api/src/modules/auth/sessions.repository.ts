import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../infra/prisma/prisma.service';

@Injectable()
export class SessionsRepository {
  constructor(private readonly prisma: PrismaService) {}

  createSessionWithRefreshToken(params: {
    userId: string;
    tokenHash: string;
    expiresAt: Date;
    userAgent?: string;
    ipAddress?: string;
  }) {
    return this.prisma.session.create({
      data: {
        userId: params.userId,
        userAgent: params.userAgent,
        ipAddress: params.ipAddress,
        refreshTokens: {
          create: { tokenHash: params.tokenHash, expiresAt: params.expiresAt },
        },
      },
      include: { refreshTokens: true },
    });
  }

  findRefreshTokenByHash(tokenHash: string) {
    return this.prisma.refreshToken.findUnique({
      where: { tokenHash },
      include: { session: true },
    });
  }

  /// Usado pelo período de graça da deteção de reutilização (ver
  /// AuthService.refresh) — dá o token válido MAIS RECENTE de uma sessão,
  /// independentemente de qual token foi apresentado no pedido.
  findActiveRefreshTokenForSession(sessionId: string) {
    return this.prisma.refreshToken.findFirst({
      where: { sessionId, revokedAt: null },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Rotação: a linha antiga fica marcada como usada/substituída (nunca
   * apagada — precisamos dela para detetar reutilização), e uma nova
   * linha é criada para a mesma sessão.
   */
  async rotateRefreshToken(params: {
    oldTokenId: string;
    sessionId: string;
    newTokenHash: string;
    newExpiresAt: Date;
  }) {
    const [, newToken] = await this.prisma.$transaction([
      this.prisma.refreshToken.update({
        where: { id: params.oldTokenId },
        data: { revokedAt: new Date() },
      }),
      this.prisma.refreshToken.create({
        data: {
          sessionId: params.sessionId,
          tokenHash: params.newTokenHash,
          expiresAt: params.newExpiresAt,
        },
      }),
      this.prisma.session.update({
        where: { id: params.sessionId },
        data: { lastUsedAt: new Date() },
      }),
    ]);

    await this.prisma.refreshToken.update({
      where: { id: params.oldTokenId },
      data: { replacedById: newToken.id },
    });

    return newToken;
  }

  revokeSession(sessionId: string, reason: string) {
    return this.prisma.session.update({
      where: { id: sessionId },
      data: { revokedAt: new Date(), revokedReason: reason },
    });
  }

  /**
   * `exceptSessionId` opcional: usado por changePassword (autenticado) para
   * derrubar todas as OUTRAS sessões mas manter a atual válida — ao
   * contrário do reset de password "esqueci-me", onde não há sessão atual
   * de confiança e por isso todas caem (chamado sem este parâmetro).
   */
  async revokeAllSessionsForUser(userId: string, reason: string, exceptSessionId?: string) {
    await this.prisma.session.updateMany({
      where: { userId, revokedAt: null, ...(exceptSessionId ? { id: { not: exceptSessionId } } : {}) },
      data: { revokedAt: new Date(), revokedReason: reason },
    });
  }
}
