import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import config from '../../config/auth.config';

import type { Request } from 'express';
import * as jwt from 'jsonwebtoken';

interface AppJwtPayload extends jwt.JwtPayload {
  sub: string;
  email: string;
}

type ReqMaybeCookies = Request & { cookies?: Record<string, unknown> };

const cookieExtractor = (req?: Request): string | null => {
  const cookies = (req as ReqMaybeCookies | undefined)?.cookies;
  return typeof (cookies as Record<string, unknown> | undefined)
    ?.access_token === 'string'
    ? (cookies as Record<string, string>).access_token
    : null;
};

/**
 * JwtStrategy is a Passport strategy for validating JSON Web Tokens (JWT).
 * It extracts the JWT from the request cookies and verifies it using the public key.
 * If the JWT is valid, it returns the user information contained in the payload.
 */
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([cookieExtractor]),
      algorithms: [config().auth.algorithm],
      secretOrKey: config().auth.publicKey,
    });
  }

  /**
   * Validates the JWT payload.
   * This method is called by Passport.js after the JWT is extracted and verified.
   * It should return the user object or throw an error if validation fails.
   * @param payload - The payload extracted from the JWT.
   * @return An object containing the userId and email from the payload.
   */
  validate(payload: AppJwtPayload): { userId: string; email: string } {
    return { userId: payload.sub, email: payload.email };
  }
}
