import { Body, Controller, Get, HttpCode, HttpStatus, Patch, Post, Req, Res, UnauthorizedException, UseGuards } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AuthGuard } from '@nestjs/passport';
import { Throttle } from '@nestjs/throttler';
import type { Request, Response } from 'express';
import { Public } from '../../common/decorators/public.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { AuthenticatedUser } from './interfaces/authenticated-user.interface';
import type { GoogleProfile } from './strategies/google.strategy';
import { GoogleAuthGuard } from './guards/google-auth.guard';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { ChangeEmailDto } from './dto/change-email.dto';
import { ConfirmEmailChangeDto } from './dto/confirm-email-change.dto';
import { GoogleMobileLoginDto } from './dto/google-mobile-login.dto';

const REFRESH_COOKIE_NAME = 'lp_refresh_token';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {}

  @Public()
  @Post('register')
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  async register(@Body() dto: RegisterDto, @Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const result = await this.authService.register(dto, this.buildContext(req));
    this.setRefreshCookie(res, result.refreshToken);
    return result;
  }

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 10, ttl: 60_000 } })
  async login(@Body() dto: LoginDto, @Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const result = await this.authService.login(dto, this.buildContext(req));
    this.setRefreshCookie(res, result.refreshToken);
    return result;
  }

  @Public()
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 20, ttl: 60_000 } })
  async refresh(
    @Body() dto: RefreshTokenDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const rawToken = req.cookies?.[REFRESH_COOKIE_NAME] ?? dto.refreshToken;
    if (!rawToken) {
      throw new UnauthorizedException('Refresh token em falta.');
    }

    const result = await this.authService.refresh(rawToken, this.buildContext(req));
    this.setRefreshCookie(res, result.refreshToken);
    return result;
  }

  @Post('logout')
  @HttpCode(HttpStatus.NO_CONTENT)
  async logout(
    @CurrentUser() user: AuthenticatedUser,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    await this.authService.logout(user.sessionId, user.userId, this.buildContext(req));
    this.clearRefreshCookie(res);
  }

  @Post('logout-all')
  @HttpCode(HttpStatus.NO_CONTENT)
  async logoutAll(
    @CurrentUser() user: AuthenticatedUser,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    await this.authService.logoutAll(user.userId, this.buildContext(req));
    this.clearRefreshCookie(res);
  }

  @Public()
  @Get('google')
  @UseGuards(GoogleAuthGuard)
  googleLogin() {
    // Nunca executa — o GoogleAuthGuard intercepta e redireciona para o
    // ecrã de consentimento do Google antes de chegar aqui. Aceita
    // ?role=PROFESSIONAL (ver GoogleAuthGuard) para o registo de
    // profissional; sem o parâmetro, assume CLIENT.
  }

  @Public()
  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  async googleCallback(@Req() req: Request, @Res() res: Response) {
    const profile = req.user as GoogleProfile;
    // A Google devolve aqui, tal e qual, o `state` que o GoogleAuthGuard
    // enviou no início do fluxo — é como sabemos se o clique foi no
    // botão "Entrar com Google" (cliente) ou no do registo de profissional.
    const intendedRole = req.query.state === 'PROFESSIONAL' ? 'PROFESSIONAL' : undefined;
    const result = await this.authService.loginWithGoogle(profile, this.buildContext(req), intendedRole);
    this.setRefreshCookie(res, result.refreshToken);

    // Redireciona de volta ao website — a sessão fica pronta porque o
    // AuthProvider (Website) já faz um refresh silencioso ao carregar
    // qualquer página, usando este mesmo cookie httpOnly. Nunca se
    // expõe o access token na URL de redirect.
    const frontendUrl = this.configService.get<string>('CORS_ORIGIN')?.split(',')[0] ?? '/';
    const destination = result.requiresCategorySelection
      ? '/registo/profissional/categorias'
      : result.user.role === 'PROFESSIONAL'
        ? '/dashboard/profissional'
        : '/dashboard/cliente';
    res.redirect(`${frontendUrl}${destination}`);
  }

  /**
   * Caminho de login/registo com Google para a app móvel — o Flutter
   * troca o ID token nativo do Google por uma sessão nossa aqui, em vez
   * do redirecionamento de página inteira usado no site (`/auth/google`),
   * que não existe numa app. Devolve tokens no corpo (JSON), tal como
   * `/auth/login` — o cookie fica definido na mesma para o caso raro de
   * um WebView, mas o `ApiService` do Flutter já lê `refreshToken` do
   * corpo, como faz para email/password.
   */
  @Public()
  @Post('google/mobile')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 10, ttl: 60_000 } })
  async googleMobileLogin(
    @Body() dto: GoogleMobileLoginDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const profile = await this.authService.verifyGoogleIdToken(dto.idToken);
    const result = await this.authService.loginWithGoogle(profile, this.buildContext(req), dto.role);
    this.setRefreshCookie(res, result.refreshToken);
    return result;
  }

  @Public()
  @Post('forgot-password')
  @HttpCode(HttpStatus.NO_CONTENT)
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  async forgotPassword(@Body() dto: ForgotPasswordDto, @Req() req: Request) {
    await this.authService.forgotPassword(dto, this.buildContext(req));
  }

  @Public()
  @Post('reset-password')
  @HttpCode(HttpStatus.NO_CONTENT)
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  async resetPassword(@Body() dto: ResetPasswordDto, @Req() req: Request) {
    await this.authService.resetPassword(dto, this.buildContext(req));
  }

  @Patch('change-password')
  @HttpCode(HttpStatus.NO_CONTENT)
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  async changePassword(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: ChangePasswordDto,
    @Req() req: Request,
  ) {
    await this.authService.changePassword(user.userId, user.sessionId, dto, this.buildContext(req));
  }

  @Post('change-email')
  @HttpCode(HttpStatus.NO_CONTENT)
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  async requestEmailChange(@CurrentUser() user: AuthenticatedUser, @Body() dto: ChangeEmailDto, @Req() req: Request) {
    await this.authService.requestEmailChange(user.userId, dto, this.buildContext(req));
  }

  @Public()
  @Post('confirm-email-change')
  @HttpCode(HttpStatus.NO_CONTENT)
  @Throttle({ default: { limit: 10, ttl: 60_000 } })
  async confirmEmailChange(@Body() dto: ConfirmEmailChangeDto, @Req() req: Request) {
    await this.authService.confirmEmailChange(dto.token, this.buildContext(req));
  }

  /**
   * BUG CRÍTICO corrigido aqui: frontend (Vercel) e API (Railway) vivem em
   * domínios completamente diferentes — isto é um pedido CROSS-SITE, não
   * apenas cross-origin. Um cookie `SameSite=Lax` NUNCA é enviado num
   * pedido cross-site feito por JS (fetch/XHR), seja qual for o método —
   * `Lax` só permite o cookie em navegações de topo (ex: clicar num link).
   * Isto significa que, em produção, o cookie `lp_refresh_token` nunca
   * chegava à API na chamada de refresh silencioso, e a sessão morria
   * sempre que o access token expirava (15 min) ou a página recarregava —
   * apesar de todo o mecanismo de rotação de tokens estar correto.
   *
   * A correção correta (não um hack) é `SameSite=None; Secure` — o padrão
   * standard para cookies de sessão partilhados entre frontend e API em
   * domínios distintos (ex: Auth0, Supabase). Isto só é seguro porque:
   *  1. O cookie continua `httpOnly` (inacessível a JS/XSS).
   *  2. `enableCors` em main.ts usa uma allow-list explícita de origens
   *     (nunca `*`) — um pedido cross-site de um domínio não autorizado
   *     falha no preflight CORS antes de o pedido POST real ser enviado.
   *  3. `Secure` obriga HTTPS, que já é garantido tanto por Vercel como
   *     por Railway.
   */
  private setRefreshCookie(res: Response, token: string) {
    const isProduction = this.configService.get<string>('NODE_ENV') === 'production';
    res.cookie(REFRESH_COOKIE_NAME, token, {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? 'none' : 'lax',
      path: '/auth',
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });
  }

  // clearCookie precisa dos MESMOS atributos (path/sameSite/secure) com que
  // o cookie foi definido — caso contrário alguns browsers (Chrome incluído)
  // ignoram o pedido de remoção silenciosamente.
  private clearRefreshCookie(res: Response) {
    const isProduction = this.configService.get<string>('NODE_ENV') === 'production';
    res.clearCookie(REFRESH_COOKIE_NAME, {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? 'none' : 'lax',
      path: '/auth',
    });
  }

  private buildContext(req: Request) {
    return {
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    };
  }
}
