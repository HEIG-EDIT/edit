import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { PassportModule } from '@nestjs/passport';
import { OAuthStrategy } from './oauth.strategy';

@Module({
  imports: [PassportModule],
  providers: [AuthService, OAuthStrategy],
})
export class AuthModule {}