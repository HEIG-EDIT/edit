import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import process from 'node:process';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy, 'local') {
  constructor() {
    super({ usernameField: 'email' });
  }

  //TODO
  // async validate(email: string, password: string) {
  //   const user = await this.validateUserByEmail(email, password);
  //   if (!user) throw new UnauthorizedException('Invalid email or password');
  //   return user;
  // }
}
