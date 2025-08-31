// src/auth/strategies/microsoft.strategy.ts
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-microsoft';

@Injectable()
export class MicrosoftStrategy extends PassportStrategy(Strategy, 'microsoft') {
  constructor() {
    super({
      clientID: process.env.MICROSOFT_CLIENT_ID as string,
      clientSecret: process.env.MICROSOFT_CLIENT_SECRET as string,
      // UPDATED: allow either MICROSOFT_CALLBACK_URL or MICROSOFT_CALLBACK_URL_LOCAL
      callbackURL:
        (process.env.MICROSOFT_CALLBACK_URL as string) ??
        (process.env.MICROSOFT_CALLBACK_URL_LOCAL as string),
      tenant: process.env.MICROSOFT_TENANT_ID ?? 'common',
      // UPDATED: include User.Read so the library can fetch email reliably
      scope: ['openid', 'profile', 'email', 'offline_access', 'User.Read'],
      // prompt: 'select_account', // optional
    });
  }

  // Keep this as simple as your Google strategy, but with basic fallbacks
  // to actually get an email from Microsoft tenants.
  validate(accessToken: string, refreshToken: string, profile: any) {
    // Common places where email shows up depending on tenant:
    // - profile.emails[0].value
    // - profile._json.mail
    // - profile._json.userPrincipalName
    // - profile._json.preferred_username
    const email =
      profile?.emails?.[0]?.value ??
      profile?._json?.mail ??
      profile?._json?.userPrincipalName ??
      profile?._json?.preferred_username;

    if (!email) {
      throw new UnauthorizedException(
        'No email available from Microsoft profile',
      );
    }

    return {
      email,
      oauthId: profile.id,
      provider: profile.provider, // "microsoft"
    };
  }
}
