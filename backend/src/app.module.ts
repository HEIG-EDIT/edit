import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { StorageModule } from './storage/storage.module';
import { TokensService } from './tokens/tokens.service';
import { EmailService } from './email/email.service';

@Module({
  imports: [AuthModule, UsersModule, StorageModule],
  controllers: [AppController],
  providers: [AppService, TokensService, EmailService],
})
export class AppModule {}
