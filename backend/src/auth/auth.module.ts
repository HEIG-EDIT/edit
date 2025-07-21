import { Module } from '@nestjs/common';
import {PassportModule} from '@nestjs/passport';
import {JwtModule} from '@nestjs/jwt';

import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';

import {GoogleStrategy} from "./strategies/google.strategy";
import {MicrosoftStrategy} from "./strategies/microsoft.strategy";


@Module({
  providers: [AuthService],
  controllers: [AuthController]
})
export class AuthModule {}
