import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { TwoFaService } from '../auth/twoFA/twofa.service';
import { TokensService } from '../auth/tokens/tokens.service';
import { AuthService } from '../auth/auth.service';
import { UsersController } from './users.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { EmailModule } from '../email/email.module';

import { JwtService } from '@nestjs/jwt';

@Module({
  imports: [PrismaModule, EmailModule],
  providers: [
    UsersService,
    TwoFaService,
    TokensService,
    AuthService,
    JwtService,
  ],
  controllers: [UsersController],
})
export class UsersModule {}
