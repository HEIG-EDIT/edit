import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { AuthService } from '../auth/auth.service';
import { UsersController } from './users.controller';
import { PrismaModule } from '../prisma/prisma.module';

import { JwtService } from '@nestjs/jwt';

@Module({
  imports: [PrismaModule],
  providers: [UsersService, AuthService, JwtService],
  controllers: [UsersController],
})
export class UsersModule {}
