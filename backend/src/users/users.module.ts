import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { AuthService } from '../auth/auth.service';
import { UsersController } from './users.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { TokensService } from '../auth/tokens/tokens.service';

import { JwtService } from '@nestjs/jwt';

@Module({
  imports: [PrismaModule],
  providers: [UsersService, AuthService, JwtService, TokensService],
  controllers: [UsersController],
})
export class UsersModule {}
