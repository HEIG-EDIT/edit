import { Module, forwardRef } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { PrismaModule } from '../prisma/prisma.module';

import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';

import { GoogleStrategy } from './strategies/google.strategy';
import { MicrosoftStrategy } from './strategies/microsoft.strategy';
import { LinkedInStrategy } from './strategies/linkedin.strategy';
import { JwtStrategy } from './strategies/jwt.strategy';

import { UsersModule } from '../users/users.module';
import { UsersService } from '../users/users.service';

import { TokensModule } from './tokens/tokens.module';
import { TokensService } from './tokens/tokens.service';

import config from '../config/auth.config';

@Module({
  imports: [
    PrismaModule,
    PassportModule,
    TokensModule,
    forwardRef(() => UsersModule),
    JwtModule.registerAsync({
      useFactory: () => {
        const cfg = config().auth;
        return {
          privateKey: cfg.privateKey, // UPDATED
          publicKey: cfg.publicKey, // UPDATED
          signOptions: {
            algorithm: cfg.algorithm, // RS256
            expiresIn: cfg.accessTokenExpiry,
          },
          verifyOptions: {
            algorithms: [cfg.algorithm], // ensure verifier uses RS256
          },
        };
      },
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    JwtStrategy,
    UsersService,
    GoogleStrategy,
    MicrosoftStrategy,
    LinkedInStrategy,
    TokensService,
  ],
  exports: [AuthService, JwtModule],
})
export class AuthModule {}
