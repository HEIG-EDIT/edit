import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  Res,
  Query,
  UseGuards,
  UsePipes,
  HttpCode,
  Headers,
  ValidationPipe,
  HttpStatus,
  BadRequestException,
} from '@nestjs/common';
import { Response, Request } from 'express';
import { AuthGuard } from '@nestjs/passport';

import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { VerifyTwoFaDto } from './dto/verify-twofa.dto';
import { LogoutDto } from './dto/logout.dto';

import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { TwoFaService } from './twoFA/twofa.service';

import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private userService: UsersService,
    private twofaService: TwoFaService,
  ) {}

  //Add HTTP responses and guards for the endpoints (+swagger)
  @Post('register')
  register(@Body() body: RegisterDto) {
    return this.authService.registerUser(body);
  }

  //TODO: Add HTTP responses and guards for the endpoints (+swagger)
  @Get('confirm-email')
  async confirmEmail(@Query('token') token: string, @Res() res: Response) {
    const redirectUrl = await this.authService.confirmEmail(token);
    return res.redirect(302, redirectUrl.email);
  }

  //TODO: Add HTTP responses and guards for the endpoints (+swagger)
  @Post('login')
  login(@Body() body: LoginDto) {
    return this.authService.loginUser(body);
  }

  //---------------------------API for Logout--------------------------------------
  /**
   * POST /auth/logout
   *
   * Logs out the current device (revokes refresh token for this device).
   * - Requires JWT (access token) in the Authorization header.
   * - Reads deviceId from `X-Device-Id` header or from body as a fallback.
   * - If you store refresh token in a cookie, clear it here (see comment).
   */
  @UseGuards(JwtAuthGuard)
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logout(
    @Req()
    req: Request & {
      user?: { userId?: number; id?: number; auth_id?: number };
    },
    @Headers('x-device-id') deviceIdHeader: string | undefined,
    @Body() body: LogoutDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<{ message: string }> {
    const userId = req.user?.userId ?? req.user?.id ?? req.user?.auth_id;
    if (!userId) {
      throw new BadRequestException('Unauthorized');
    }

    const deviceId = deviceIdHeader ?? body.deviceId;
    if (!deviceId) {
      throw new BadRequestException('Missing deviceId');
    }

    // When using cookie-based refresh tokens, also clear cookie here:
    res.clearCookie('refresh_token', {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      path: '/',
    });

    return this.authService.logoutUser(Number(userId), deviceId);
  }

  /**
   * POST /auth/logout-all
   *
   * Logs out from all devices (revokes all refresh tokens for the user).
   * - Requires JWT (access token).
   * - If you use cookie-based refresh tokens, clear the cookie too.
   */
  @UseGuards(JwtAuthGuard)
  @Post('logout-all')
  @HttpCode(HttpStatus.OK)
  async logoutAll(
    @Req()
    req: Request & {
      user?: { userId?: number; id?: number; auth_id?: number };
    },
    @Res({ passthrough: true }) res: Response,
  ): Promise<{ revoked: number }> {
    const userId = req.user?.userId ?? req.user?.id ?? req.user?.auth_id;
    if (!userId) {
      throw new BadRequestException('Unauthorized');
    }

    res.clearCookie('refresh_token', {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      path: '/',
    });

    return this.authService.logoutAllDevices(Number(userId));
  }

  //---------------------------API for Token Handling--------------------------------------

  //TODO
  // Placeholder for access token refresh
  //@Post('refresh')
  //refresh(@Body() body: { refreshToken: string }) {}

  //--------------------------API for Provider LogIn--------------------------------------

  //TODO
  // Placeholder for Google login
  @Get('google')
  @UseGuards(AuthGuard('google'))
  googleLogin() {}

  //TODO
  // Placeholder for Google login callback
  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  async googleAuthCallback() {}

  //TODO
  // Placeholder for LinkedIn login
  @Get('linkedin')
  @UseGuards(AuthGuard('linkedin'))
  linkedinLogin() {}

  //TODO
  // Placeholder for LinkedIn login callback
  @Get('linkedin/callback')
  @UseGuards(AuthGuard('linkedin'))
  async linkedinAuthCallback() {}

  //TODO
  // Placeholder for Microsoft login
  @Get('microsoft')
  @UseGuards(AuthGuard('microsoft'))
  microsoftLogin() {}

  //TODO
  // Placeholder for Microsoft login callback
  @Get('microsoft/callback')
  @UseGuards(AuthGuard('microsoft'))
  async microsoftAuthCallback() {}

  // TODO : X and Facebook login and callback

  // ----------------- 2FA: VERIFY -----------------
  /**
   * POST /auth/2fa/verify
   *
   * Verifies a 2FA challenge with a code.
   * - Commits enable/disable effects when applicable.
   *
   * Body: { twofaToken, code }
   * Returns: { success: true, action, method }
   */
  @UseGuards(JwtAuthGuard)
  @UsePipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  )
  @Post('2fa/verify')
  @HttpCode(HttpStatus.OK)
  async verifyTwoFa(
    @Req()
    req: Request & {
      user?: { userId?: number; id?: number; auth_id?: number };
    },
    @Body() body: VerifyTwoFaDto,
  ): Promise<{
    success: true;
    action:
      | 'enable2fa'
      | 'disable2fa'
      | 'login'
      | 'changePassword'
      | 'passwordRecovery';
    method: 'totp' | 'email' | 'sms';
  }> {
    const userId = req.user?.userId ?? req.user?.id ?? req.user?.auth_id;
    if (!userId)
      throw Object.assign(new Error('Unauthorized'), { status: 401 });

    return await this.twofaService.verifyChallenge(
      Number(userId),
      body.twofaToken,
      body.code,
    );
  }
}
