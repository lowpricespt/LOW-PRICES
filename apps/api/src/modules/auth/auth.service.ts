import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersRepository } from '../users/users.repository';
import { UserResponseDto } from '../users/dto/user-response.dto';
import { AuditLogService, AuditAction } from '../audit-log/audit-log.service';
import { PasswordService } from './services/password.service';
import { TokenService } from './services/token.service';
import { SessionsRepository } from './sessions.repository';
import { PrismaService } from '../../infra/prisma/prisma.service';
import { EmailService } from '../../infra/email/email.service';
import { ConfigService } from '@nestjs/config';
import type { RegisterDto } from './dto/register.dto';
import type { LoginDto } from './dto/login.dto';
import type { AuthResponseDto } from './dto/auth-response.dto';
import type { ForgotPasswordDto } from './dto/forgot-password.dto';
import type { ResetPasswordDto } from './dto/reset-password.dto';

interface RequestContext {
  ipAddress?: string;
  userAgent?: string;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly sessionsRepository: SessionsRepository,
    private readonly passwordService: PasswordService,
    private readonly tokenService: TokenService,
    private readonly auditLogService: AuditLogService,
    private readonly prisma: PrismaService,
    private readonly emailService: EmailService,
    private readonly configService: ConfigService,
  ) {}

  async register(dto: RegisterDto, context: RequestContext): Promise<AuthResponseDto> {
    const existing = await this.usersRepository.findByEmail(dto.email);
    if (existing) {
      throw new ConflictException('Já existe uma conta com este email.');
    }

    const passwordHash = await this.passwordService.hash(dto.password);
    const user = await this.usersRepository.create({
      email: dto.email,
      name: dto.name,
      passwordHash,
      role: dto.role,
    });

    await this.auditLogService.record({
      userId: user.id,
      action: AuditAction.USER_REGISTERED,
      metadata: { role: dto.role },
      ipAddress: context.ipAddress,
    });

    return this.issueTokensForUser(user.id, user.role, context);
  }

  /**
   * Fluxo do Login com Google:
   *  1. Já existe um User com este googleId? → login direto.
   *  2. Não, mas existe um User com este email (registado por password)?
   *     → liga o googleId a essa conta existente (mesma pessoa, novo
   *     método de login), nunca cria uma conta duplicada.
   *  3. Não existe nenhum → cria uma conta nova, role CLIENT por
   *     omissão (um Especialista que queira entrar por Google pode
   *     mudar de role mais tarde nas Definições — decisão simples para
   *     não complicar o ecrã de consentimento do Google com escolha de
   *     role a meio do fluxo OAuth).
   */
  async loginWithGoogle(
    profile: { googleId: string; email: string; name: string },
    context: RequestContext,
  ): Promise<AuthResponseDto> {
    let user = await this.usersRepository.findByGoogleId(profile.googleId);

    if (!user) {
      const existingByEmail = await this.usersRepository.findByEmail(profile.email);
      if (existingByEmail) {
        user = await this.usersRepository.linkGoogleId(existingByEmail.id, profile.googleId);
      } else {
        user = await this.usersRepository.create({
          email: profile.email,
          name: profile.name,
          googleId: profile.googleId,
          role: 'CLIENT',
        });
        await this.auditLogService.record({
          userId: user.id,
          action: AuditAction.USER_REGISTERED,
          metadata: { role: 'CLIENT', via: 'google' },
          ipAddress: context.ipAddress,
        });
      }
    }

    if (user.status !== 'ACTIVE') {
      throw new UnauthorizedException('Esta conta está desativada.');
    }

    return this.issueTokensForUser(user.id, user.role, context);
  }

  /**
   * Nunca revela se o email existe (mesma proteção contra enumeração de
   * contas usada no login) — a resposta é sempre "se existir, enviámos
   * o link", quer o email exista quer não.
   */
  async forgotPassword(dto: ForgotPasswordDto, context: RequestContext): Promise<void> {
    const user = await this.usersRepository.findByEmail(dto.email);
    if (!user || user.status !== 'ACTIVE') return;

    const { raw, hash } = this.tokenService.generatePasswordResetToken();
    await this.prisma.passwordResetToken.create({
      data: { userId: user.id, tokenHash: hash, expiresAt: new Date(Date.now() + 60 * 60 * 1000) }, // 1h
    });

    const resetUrl = `${this.configService.get<string>('CORS_ORIGIN') ?? ''}/redefinir-password?token=${raw}`;
    await this.emailService.send({
      to: user.email,
      subject: 'Recupera a tua palavra-passe — Low Prices',
      html: `
        <p>Olá ${user.name},</p>
        <p>Recebemos um pedido para recuperares a tua palavra-passe. Este link expira em 1 hora:</p>
        <p><a href="${resetUrl}">${resetUrl}</a></p>
        <p>Se não foste tu a pedir, ignora este email.</p>
      `,
    });

    await this.auditLogService.record({
      userId: user.id,
      action: AuditAction.PASSWORD_RESET_REQUESTED,
      ipAddress: context.ipAddress,
    });
  }

  async resetPassword(dto: ResetPasswordDto, context: RequestContext): Promise<void> {
    const tokenHash = this.tokenService.hashRefreshToken(dto.token); // mesmo SHA-256, reutilizado
    const resetToken = await this.prisma.passwordResetToken.findUnique({ where: { tokenHash } });

    if (!resetToken || resetToken.usedAt || resetToken.expiresAt < new Date()) {
      throw new UnauthorizedException('Este link de recuperação é inválido ou já expirou.');
    }

    const passwordHash = await this.passwordService.hash(dto.newPassword);
    await this.prisma.$transaction([
      this.prisma.user.update({ where: { id: resetToken.userId }, data: { passwordHash } }),
      this.prisma.passwordResetToken.update({ where: { id: resetToken.id }, data: { usedAt: new Date() } }),
    ]);

    // Segurança: redefinir a password termina todas as sessões ativas —
    // se alguém tinha acesso indevido à conta, perde-o aqui.
    await this.sessionsRepository.revokeAllSessionsForUser(resetToken.userId, 'password_reset');

    await this.auditLogService.record({
      userId: resetToken.userId,
      action: AuditAction.PASSWORD_RESET_COMPLETED,
      ipAddress: context.ipAddress,
    });
  }

  async login(dto: LoginDto, context: RequestContext): Promise<AuthResponseDto> {
    const user = await this.usersRepository.findByEmail(dto.email);

    // Mensagem idêntica quer o email exista quer não — nunca revelar se
    // um email está registado (evita enumeração de contas).
    const invalidCredentialsError = new UnauthorizedException('Email ou palavra-passe incorretos.');

    if (!user || user.status !== 'ACTIVE') {
      await this.auditLogService.record({
        action: AuditAction.LOGIN_FAILED,
        metadata: { email: dto.email },
        ipAddress: context.ipAddress,
      });
      throw invalidCredentialsError;
    }

    const isPasswordValid =
      user.passwordHash !== null && (await this.passwordService.verify(user.passwordHash, dto.password));
    if (!isPasswordValid) {
      await this.auditLogService.record({
        userId: user.id,
        action: AuditAction.LOGIN_FAILED,
        ipAddress: context.ipAddress,
      });
      throw invalidCredentialsError;
    }

    await this.auditLogService.record({
      userId: user.id,
      action: AuditAction.USER_LOGGED_IN,
      ipAddress: context.ipAddress,
    });

    return this.issueTokensForUser(user.id, user.role, context);
  }

  /**
   * Fluxo de refresh com deteção de roubo de token: se o token
   * apresentado já tiver sido substituído por rotação anterior (ou seja,
   * alguém está a reutilizar um token antigo), TODAS as sessões do
   * utilizador são revogadas imediatamente — é o sinal mais forte de que
   * um refresh token foi roubado e copiado.
   */
  async refresh(rawToken: string, context: RequestContext): Promise<AuthResponseDto> {
    const tokenHash = this.tokenService.hashRefreshToken(rawToken);
    const existingToken = await this.sessionsRepository.findRefreshTokenByHash(tokenHash);

    if (!existingToken || existingToken.expiresAt < new Date() || existingToken.session.revokedAt) {
      throw new UnauthorizedException('Sessão expirada. Inicia sessão novamente.');
    }

    if (existingToken.revokedAt) {
      await this.sessionsRepository.revokeAllSessionsForUser(
        existingToken.session.userId,
        'refresh_token_reuse_detected',
      );
      await this.auditLogService.record({
        userId: existingToken.session.userId,
        action: AuditAction.TOKEN_REUSE_DETECTED,
        ipAddress: context.ipAddress,
      });
      throw new UnauthorizedException('Atividade suspeita detetada. Inicia sessão novamente.');
    }

    const user = await this.usersRepository.findById(existingToken.session.userId);
    if (!user || user.status !== 'ACTIVE') {
      throw new UnauthorizedException('Sessão inválida.');
    }

    const { raw, hash } = this.tokenService.generateRefreshToken();
    const expiresAt = new Date(Date.now() + this.tokenService.getRefreshTokenTtlMs());

    await this.sessionsRepository.rotateRefreshToken({
      oldTokenId: existingToken.id,
      sessionId: existingToken.sessionId,
      newTokenHash: hash,
      newExpiresAt: expiresAt,
    });

    await this.auditLogService.record({
      userId: user.id,
      action: AuditAction.TOKEN_REFRESHED,
      ipAddress: context.ipAddress,
    });

    const accessToken = this.tokenService.signAccessToken({
      userId: user.id,
      role: user.role,
      sessionId: existingToken.sessionId,
    });

    return { accessToken, refreshToken: raw, user: UserResponseDto.fromEntity(user) };
  }

  async logout(sessionId: string, userId: string, context: RequestContext): Promise<void> {
    await this.sessionsRepository.revokeSession(sessionId, 'user_logout');
    await this.auditLogService.record({
      userId,
      action: AuditAction.USER_LOGGED_OUT,
      ipAddress: context.ipAddress,
    });
  }

  async logoutAll(userId: string, context: RequestContext): Promise<void> {
    await this.sessionsRepository.revokeAllSessionsForUser(userId, 'user_logout_all');
    await this.auditLogService.record({
      userId,
      action: AuditAction.USER_LOGGED_OUT_ALL,
      ipAddress: context.ipAddress,
    });
  }

  private async issueTokensForUser(
    userId: string,
    role: 'CLIENT' | 'PROFESSIONAL' | 'ADMIN',
    context: RequestContext,
  ): Promise<AuthResponseDto> {
    const { raw, hash } = this.tokenService.generateRefreshToken();
    const expiresAt = new Date(Date.now() + this.tokenService.getRefreshTokenTtlMs());

    const session = await this.sessionsRepository.createSessionWithRefreshToken({
      userId,
      tokenHash: hash,
      expiresAt,
      userAgent: context.userAgent,
      ipAddress: context.ipAddress,
    });

    const accessToken = this.tokenService.signAccessToken({ userId, role, sessionId: session.id });
    const user = await this.usersRepository.findById(userId);

    return { accessToken, refreshToken: raw, user: UserResponseDto.fromEntity(user!) };
  }
}
