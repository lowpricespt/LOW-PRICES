import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';

export interface GoogleProfile {
  googleId: string;
  email: string;
  name: string;
}

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(configService: ConfigService) {
    // Tal como o R2StorageProvider: se as credenciais do Google ainda não
    // estiverem configuradas, usamos placeholders para o construtor do
    // Passport não rebentar o arranque da app inteira. Só falha (com um
    // erro claro) quando alguém tenta mesmo usar /auth/google — ver
    // AuthController.
    super({
      clientID: configService.get<string>('GOOGLE_CLIENT_ID') || 'not-configured',
      clientSecret: configService.get<string>('GOOGLE_CLIENT_SECRET') || 'not-configured',
      callbackURL: configService.get<string>('GOOGLE_CALLBACK_URL') || 'http://localhost:3000/auth/google/callback',
      scope: ['email', 'profile'],
    });
  }

  validate(_accessToken: string, _refreshToken: string, profile: any, done: VerifyCallback): void {
    const email = profile.emails?.[0]?.value;
    if (!email) {
      done(new Error('A conta Google não tem um email associado.'), false);
      return;
    }
    const googleProfile: GoogleProfile = {
      googleId: profile.id,
      email,
      name: profile.displayName ?? email,
    };
    done(null, googleProfile);
  }
}
