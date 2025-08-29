import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { StorageModule } from './storage/storage.module';
import { UsersModule } from './users/users.module';
import { ConfigModule } from '@nestjs/config';
import { AppConfigModule } from './config/config.module';
import { ProjectModule } from './project/project.module';
import { CollaborationModule } from './collaboration/collaboration.module';
import { S3Module } from './s3/s3.module';

ConfigModule.forRoot({
  isGlobal: true,
  envFilePath: './.env',
});

@Module({
  imports: [
    AuthModule,
    StorageModule,
    UsersModule,
    ProjectModule,
    CollaborationModule,
    S3Module,
    AppConfigModule,
  ],
})
export class AppModule {}
