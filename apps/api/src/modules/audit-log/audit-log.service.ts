import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../infra/prisma/prisma.service';
import type { Prisma } from '@prisma/client';

export enum AuditAction {
  USER_REGISTERED = 'USER_REGISTERED',
  USER_LOGGED_IN = 'USER_LOGGED_IN',
  USER_LOGGED_OUT = 'USER_LOGGED_OUT',
  USER_LOGGED_OUT_ALL = 'USER_LOGGED_OUT_ALL',
  TOKEN_REFRESHED = 'TOKEN_REFRESHED',
  TOKEN_REUSE_DETECTED = 'TOKEN_REUSE_DETECTED',
  LOGIN_FAILED = 'LOGIN_FAILED',
  PROFILE_UPDATED = 'PROFILE_UPDATED',
  ACCOUNT_DELETED = 'ACCOUNT_DELETED',
  PASSWORD_RESET_REQUESTED = 'PASSWORD_RESET_REQUESTED',
  PASSWORD_RESET_COMPLETED = 'PASSWORD_RESET_COMPLETED',
}

@Injectable()
export class AuditLogService {
  constructor(private readonly prisma: PrismaService) {}

  async record(params: {
    userId?: string | null;
    action: AuditAction;
    metadata?: Prisma.InputJsonValue;
    ipAddress?: string | null;
  }) {
    // Auditoria nunca deve derrubar o fluxo principal — se falhar a
    // gravar o log, regista o erro mas não lança exceção.
    try {
      await this.prisma.auditLog.create({
        data: {
          userId: params.userId ?? null,
          action: params.action,
          metadata: params.metadata,
          ipAddress: params.ipAddress ?? null,
        },
      });
    } catch {
      // silencioso de propósito — ver comentário acima
    }
  }
}
