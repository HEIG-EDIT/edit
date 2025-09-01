// src/auth/strategies/microsoft.strategy.ts
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-microsoft';

import * as process from 'node:process';

/*
  Microsoft OAuth2 Strategy
  Documentation: https://www.npmjs.com/package/passport-microsoft
*/
@Injectable()
export class MicrosoftStrategy extends PassportStrategy(Strategy, 'microsoft') {
  constructor() {
    super({
      clientID: process.env.MICROSOFT_CLIENT_ID as string,
      clientSecret: process.env.MICROSOFT_CLIENT_SECRET as string,
      callbackURL:
        (process.env.MICROSOFT_CALLBACK_URL as string) ??
        (process.env.MICROSOFT_CALLBACK_URL_LOCAL as string),
      tenant: process.env.MICROSOFT_TENANT_ID ?? 'common',
      scope: ['openid', 'profile', 'email', 'offline_access', 'User.Read'],
    });
  }

  /**
   * Validate function to extract user information from Microsoft profile
   * @param _accessToken
   * @param _refreshToken
   * @param profile : Profile object returned by Microsoft
   * @param done : Callback function
   * @returns Object containing email, oauthId, and provider
   */
  validate(
    _accessToken: string,
    _refreshToken: string,
    profile: any,
    done: Function,
  ) {
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
