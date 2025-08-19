import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { StorageModule } from './storage/storage.module';
//import { ConfigModule } from './config/config.module';
import { TokensService } from './tokens/tokens.service';
import { EmailService } from './email/email.service';

@Module({
  imports: [AuthModule, UserModule, StorageModule],
  controllers: [AppController],
  providers: [AppService, TokensService, EmailService],
})
export class AppModule {}
