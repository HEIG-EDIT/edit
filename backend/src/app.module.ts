import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { StorageModule } from './storage/storage.module';
import { UsersModule } from './users/users.module';
//import { ConfigModule } from './config/config.module';
import { EmailService } from './email/email.service';

@Module({
  imports: [AuthModule, StorageModule, UsersModule],
  providers: [EmailService],
})
export class AppModule {}
