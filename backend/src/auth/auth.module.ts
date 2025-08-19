import { Module, forwardRef } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { PrismaModule } from '../prisma/prisma.module';

import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';

//import { GoogleStrategy } from './strategies/google.strategy';
//import { MicrosoftStrategy } from './strategies/microsoft.strategy';
import { JwtStrategy } from './strategies/jwt.strategy';

import { EmailModule } from '../email/email.module';
import { UserModule } from '../user/user.module';
import config from '../config/auth.config';

@Module({
  imports: [
    PrismaModule,
    PassportModule,
    forwardRef(() => UserModule), // UPDATED: handles circular deps if any
    EmailModule, // UPDATED: so EmailService can be injected
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
  providers: [AuthService, JwtStrategy],
  exports: [AuthService],
})
export class AuthModule {}
