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
      callbackURL: process.env.MICROSOFT_CALLBACK_URL_PROD as string,
      tenant: process.env.MICROSOFT_TENANT_ID ?? 'common',
      scope: ['openid', 'profile', 'email', 'offline_access', 'User.Read'],
    });
  }

  /**
   * Validate function to extract user information from Microsoft profile
   * @param _accessToken
   * @param _refreshToken
   * @param profile : Profile object returned by Microsoft
   * @param done : function
   * @returns Object containing email, oauthId, and provider
   */
  validate(
    _accessToken: string,
    _refreshToken: string,
    profile: any,
    // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type, @typescript-eslint/no-unused-vars
    done: Function,
  ) {
    // Common places where email shows up depending on tenant:
    // - profile.emails[0].value
    // - profile._json.mail
    // - profile._json.userPrincipalName
    // - profile._json.preferred_username
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const email =
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      profile?.emails?.[0]?.value ??
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      profile?._json?.mail ??
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      profile?._json?.userPrincipalName ??
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      profile?._json?.preferred_username;

    if (!email) {
      throw new UnauthorizedException(
        'No email available from Microsoft profile',
      );
    }

    return {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      email,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment,@typescript-eslint/no-unsafe-member-access
      oauthId: profile.id,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access,@typescript-eslint/no-unsafe-assignment
      provider: profile.provider, // "microsoft"
    };
  }
}
