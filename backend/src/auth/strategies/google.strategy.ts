import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-google-oauth20';

import * as process from 'node:process';

/*
  Google OAuth2 Strategy
  Documentation: https://www.npmjs.com/package/passport-google-oauth20
*/
@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor() {
    super({
      clientID: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
      callbackURL: process.env.GOOGLE_CALLBACK_URL as string,
      scope: ['email', 'profile'],
    });
  }

  /**
   * Validate function to extract user information from Google profile
   * @param _accessToken
   * @param _refreshToken
   * @param profile : Profile object returned by Google
   * @param done : Callback function
   * @returns Object containing email, oauthId, and provider
   */
  validate(
    _accessToken: string,
    _refreshToken: string,
    profile: any,
    done: Function,
  ) {
    return {
      email: profile.emails[0].value,
      oauthId: profile.id,
      provider: profile.provider,
    };
  }
}
