import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { StorageModule } from './storage/storage.module';
import { UsersModule } from './users/users.module';
import { TwoFaModule } from './auth/twoFA/twofa.module';
import { TokensModule } from './auth/tokens/tokens.module';
//import { ConfigModule } from './config/config.module';
import { EmailService } from './email/email.service';
import { ProjectModule } from './project/project.module';
import { S3Module } from './s3/s3.module';

@Module({
  imports: [AuthModule, StorageModule, UsersModule, TwoFaModule, TokensModule,ProjectModule, S3Module],
  providers: [EmailService],
})
export class AppModule {}
