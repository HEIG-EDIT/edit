import { Module, forwardRef } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { PrismaModule } from '../prisma/prisma.module';

import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';

import { GoogleStrategy } from './strategies/google.strategy';
import { JwtStrategy } from './strategies/jwt.strategy';

import { UsersModule } from '../users/users.module';
import { UsersService } from '../users/users.service';

import { JwtService } from '@nestjs/jwt';

import config from '../config/auth.config';

@Module({
  imports: [
    PrismaModule,
    PassportModule,
    forwardRef(() => UsersModule),
    JwtModule.registerAsync({
      useFactory: () => ({
        privateKey: config().auth.privateKey,
        publicKey: config().auth.publicKey,
        signOptions: {
          algorithm: config().auth.algorithm,
          expiresIn: config().auth.accessTokenExpiry,
        },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    JwtStrategy,
    UsersService,
    JwtService,
    GoogleStrategy,
  ],
  exports: [AuthService],
})
export class AuthModule {}
