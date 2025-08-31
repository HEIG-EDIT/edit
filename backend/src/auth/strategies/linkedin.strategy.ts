import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-linkedin-oauth2';

import * as process from 'node:process';

/*
  LinkedIn OAuth2 Strategy

  Documentation: https://www.npmjs.com/package/passport-linkedin-oauth2
*/
@Injectable()
export class LinkedInStrategy extends PassportStrategy(Strategy, 'linkedin') {
  constructor() {
    super({
      clientID: process.env.LINKEDIN_CLIENT_ID as string,
      clientSecret: process.env.LINKEDIN_CLIENT_SECRET as string,
      callbackURL:
        (process.env.LINKEDIN_CALLBACK_URL as string) ??
        (process.env.LINKEDIN_CALLBACK_URL_LOCAL as string),
      scope: ['r_liteprofile', 'r_emailaddress'],
    });
  }

  /**
   * Validate function to extract user information from LinkedIn profile
   * @param accessToken
   * @param refreshToken
   * @param profile : Profile object returned by LinkedIn
   * @returns Object containing email, oauthId, and provider
   */
  validate(
    accessToken: string,
    refreshToken: string,
    profile: any,
    done: Function,
  ) {
    const email =
      profile?.emails?.[0]?.value ??
      profile?._json?.emailAddress ?? // older shapes
      profile?._json?.email ?? // defensive
      null;

    if (!email) {
      throw new UnauthorizedException(
        'No email available from LinkedIn profile',
      );
    }

    return {
      email,
      oauthId: profile.id,
      provider: profile.provider, // "linkedin"
    };
  }
}
