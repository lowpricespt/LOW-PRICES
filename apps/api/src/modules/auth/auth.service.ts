import { BadRequestException, ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
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
import type { ChangePasswordDto } from './dto/change-password.dto';
import type { ChangeEmailDto } from './dto/change-email.dto';

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
   *  1. Já existe um User com este googleId? → login direto (role da
   *     conta existente, nunca a intenção do botão que foi clicado —
   *     mudar de role via login seria uma escalada de privilégio).
   *  2. Não, mas existe um User com este email (registado por password)?
   *     → liga o googleId a essa conta existente (mesma pessoa, novo
   *     método de login), role também inalterada.
   *  3. Não existe nenhum → cria uma conta nova com `intendedRole`
   *     (CLIENT por omissão) — vem do botão que a pessoa carregou
   *     (`/auth/google?role=PROFESSIONAL` no registo de profissional),
   *     passado através do parâmetro OAuth `state` (ver GoogleAuthGuard).
   *
   * `requiresCategorySelection`: true sempre que a conta é PROFESSIONAL
   * e ainda não tem nenhuma categoria escolhida — cobre tanto o
   * Especialista que acabou de criar conta via Google (nunca passou pelo
   * wizard) como um Especialista mais antigo que por alguma razão ainda
   * não as tem. O AuthController usa isto para redirecionar para o passo
   * de categorias em vez do dashboard.
   */
  async loginWithGoogle(
    profile: { googleId: string; email: string; name: string },
    context: RequestContext,
    intendedRole?: 'CLIENT' | 'PROFESSIONAL',
  ): Promise<AuthResponseDto & { requiresCategorySelection: boolean }> {
    let user = await this.usersRepository.findByGoogleId(profile.googleId);

    if (!user) {
      const existingByEmail = await this.usersRepository.findByEmail(profile.email);
      if (existingByEmail) {
        user = await this.usersRepository.linkGoogleId(existingByEmail.id, profile.googleId);
      } else {
        const role = intendedRole === 'PROFESSIONAL' ? 'PROFESSIONAL' : 'CLIENT';
        user = await this.usersRepository.create({
          email: profile.email,
          name: profile.name,
          googleId: profile.googleId,
          role,
        });
        await this.auditLogService.record({
          userId: user.id,
          action: AuditAction.USER_REGISTERED,
          metadata: { role, via: 'google' },
          ipAddress: context.ipAddress,
        });
      }
    }

    if (user.status !== 'ACTIVE') {
      throw new UnauthorizedException('Esta conta está desativada.');
    }

    let requiresCategorySelection = false;
    if (user.role === 'PROFESSIONAL') {
      const categoryCount = await this.prisma.professionalCategory.count({
        where: { professionalProfile: { userId: user.id } },
      });
      requiresCategorySelection = categoryCount === 0;
    }

    const tokens = await this.issueTokensForUser(user.id, user.role, context);
    return { ...tokens, requiresCategorySelection };
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

  /**
   * Alterar password ESTANDO autenticado (diferente do fluxo "esqueci-me
   * da password"): exige a password atual para confirmar que é mesmo o
   * dono da conta a pedir, mesmo já com uma sessão válida — protege
   * contra alguém que apanhe um browser com sessão aberta e tente
   * sequestrar a conta trocando a password.
   *
   * Termina todas as OUTRAS sessões (mantém a atual) — mesmo princípio
   * de segurança do reset por email, mas sem derrubar quem acabou de
   * fazer a alteração.
   */
  async changePassword(
    userId: string,
    currentSessionId: string,
    dto: ChangePasswordDto,
    context: RequestContext,
  ): Promise<void> {
    const user = await this.usersRepository.findById(userId);
    if (!user || !user.passwordHash) {
      throw new BadRequestException(
        'Esta conta não tem palavra-passe definida (entraste com Google) — não é possível alterá-la aqui.',
      );
    }

    const isCurrentValid = await this.passwordService.verify(user.passwordHash, dto.currentPassword);
    if (!isCurrentValid) {
      throw new UnauthorizedException('A palavra-passe atual está incorreta.');
    }

    const passwordHash = await this.passwordService.hash(dto.newPassword);
    await this.prisma.user.update({ where: { id: userId }, data: { passwordHash } });
    await this.sessionsRepository.revokeAllSessionsForUser(userId, 'password_changed', currentSessionId);

    await this.notifySafely(
      user.email,
      'A tua palavra-passe foi alterada — Low Prices',
      `
        <p>Olá ${user.name},</p>
        <p>A palavra-passe da tua conta Low Prices acabou de ser alterada. Todas as outras sessões ativas foram terminadas.</p>
        <p>Se não foste tu, contacta-nos imediatamente.</p>
      `,
    );

    await this.auditLogService.record({
      userId,
      action: AuditAction.PASSWORD_CHANGED,
      ipAddress: context.ipAddress,
    });
  }

  /**
   * Pedido de alteração de email: exige a password atual (mesma lógica
   * do changePassword) e NUNCA altera User.email de imediato — cria um
   * VerificationToken com o email pretendido e envia o link de
   * confirmação para o NOVO endereço. Isto garante que quem pede a
   * alteração tem mesmo acesso à caixa de correio nova, evitando que
   * alguém troque o email de uma conta para um endereço que não controla
   * e a sequestre.
   */
  async requestEmailChange(userId: string, dto: ChangeEmailDto, context: RequestContext): Promise<void> {
    const user = await this.usersRepository.findById(userId);
    if (!user || !user.passwordHash) {
      throw new BadRequestException(
        'Esta conta não tem palavra-passe definida (entraste com Google) — não é possível alterar o email aqui.',
      );
    }

    const isCurrentValid = await this.passwordService.verify(user.passwordHash, dto.currentPassword);
    if (!isCurrentValid) {
      throw new UnauthorizedException('A palavra-passe atual está incorreta.');
    }

    if (dto.newEmail.toLowerCase() === user.email.toLowerCase()) {
      throw new BadRequestException('Este já é o teu email atual.');
    }

    const existing = await this.usersRepository.findByEmail(dto.newEmail);
    if (existing) {
      throw new ConflictException('Já existe uma conta com este email.');
    }

    const { raw, hash } = this.tokenService.generateOpaqueToken();
    await this.prisma.verificationToken.create({
      data: {
        userId,
        type: 'EMAIL_VERIFICATION',
        tokenHash: hash,
        newEmail: dto.newEmail,
        expiresAt: new Date(Date.now() + 60 * 60 * 1000), // 1h
      },
    });

    const confirmUrl = `${this.configService.get<string>('CORS_ORIGIN')?.split(',')[0] ?? ''}/confirmar-email?token=${raw}`;
    await this.notifySafely(
      dto.newEmail,
      'Confirma o teu novo email — Low Prices',
      `
        <p>Olá ${user.name},</p>
        <p>Recebemos um pedido para associar este email à tua conta Low Prices. Este link expira em 1 hora:</p>
        <p><a href="${confirmUrl}">${confirmUrl}</a></p>
        <p>Se não foste tu a pedir, ignora este email — a tua conta mantém-se inalterada.</p>
      `,
    );

    await this.auditLogService.record({
      userId,
      action: AuditAction.EMAIL_CHANGE_REQUESTED,
      metadata: { newEmail: dto.newEmail },
      ipAddress: context.ipAddress,
    });
  }

  async confirmEmailChange(rawToken: string, context: RequestContext): Promise<void> {
    const tokenHash = this.tokenService.hashRefreshToken(rawToken); // mesmo SHA-256, reutilizado
    const verificationToken = await this.prisma.verificationToken.findUnique({ where: { tokenHash } });

    if (
      !verificationToken ||
      verificationToken.type !== 'EMAIL_VERIFICATION' ||
      !verificationToken.newEmail ||
      verificationToken.usedAt ||
      verificationToken.expiresAt < new Date()
    ) {
      throw new UnauthorizedException('Este link de confirmação é inválido ou já expirou.');
    }

    // Reconfirma que ninguém registou entretanto o mesmo email durante a
    // janela de validade do token (condição de corrida improvável, mas real).
    const existing = await this.usersRepository.findByEmail(verificationToken.newEmail);
    if (existing) {
      throw new ConflictException('Já existe uma conta com este email.');
    }

    await this.prisma.$transaction([
      this.prisma.user.update({
        where: { id: verificationToken.userId },
        data: { email: verificationToken.newEmail },
      }),
      this.prisma.verificationToken.update({
        where: { id: verificationToken.id },
        data: { usedAt: new Date() },
      }),
    ]);

    await this.auditLogService.record({
      userId: verificationToken.userId,
      action: AuditAction.EMAIL_CHANGED,
      metadata: { newEmail: verificationToken.newEmail },
      ipAddress: context.ipAddress,
    });
  }

  private async notifySafely(to: string, subject: string, html: string): Promise<void> {
    try {
      await this.emailService.send({ to, subject, html });
    } catch {
      // Falha de envio de email nunca deve derrubar o fluxo de autenticação.
    }
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
      // BUG CRÍTICO corrigido aqui: a deteção de reutilização disparava
      // (e revogava TODAS as sessões) sempre que o mesmo utilizador tinha
      // o site aberto em mais do que um separador/aba — cada aba renova
      // a sessão de forma independente, e se duas renovações chegarem
      // quase ao mesmo tempo, a segunda apresenta um token que a primeira
      // já rodou. Isto não é roubo, é o mesmo dono a usar a conta em dois
      // sítios ao mesmo tempo — mas até aqui era tratado exatamente da
      // mesma forma que um token roubado, terminando a sessão em todo o
      // lado sem aviso ("faço qualquer coisa e sou desligado").
      //
      // Correção: um período de graça curto (30s) depois de um token ser
      // rodado — se aparecer outro pedido a usar o token antigo dentro
      // desta janela, assume-se pedido concorrente legítimo (não roubo) e
      // devolve-se uma sessão válida a partir do token ATUAL da mesma
      // sessão, em vez de derrubar tudo. Fora da janela (roubo real,
      // token usado minutos/horas depois de já ter sido substituído),
      // continua a revogar tudo — a proteção real mantém-se.
      const REUSE_GRACE_PERIOD_MS = 30_000;
      const withinGracePeriod = Date.now() - existingToken.revokedAt.getTime() < REUSE_GRACE_PERIOD_MS;

      if (withinGracePeriod && !existingToken.session.revokedAt) {
        const active = await this.sessionsRepository.findActiveRefreshTokenForSession(existingToken.sessionId);
        if (active && active.expiresAt > new Date()) {
          const user = await this.usersRepository.findById(existingToken.session.userId);
          if (user && user.status === 'ACTIVE') {
            const { raw, hash } = this.tokenService.generateRefreshToken();
            const expiresAt = new Date(Date.now() + this.tokenService.getRefreshTokenTtlMs());

            await this.sessionsRepository.rotateRefreshToken({
              oldTokenId: active.id,
              sessionId: existingToken.sessionId,
              newTokenHash: hash,
              newExpiresAt: expiresAt,
            });

            const accessToken = this.tokenService.signAccessToken({
              userId: user.id,
              role: user.role,
              sessionId: existingToken.sessionId,
            });

            return { accessToken, refreshToken: raw, user: UserResponseDto.fromEntity(user) };
          }
        }
      }

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
