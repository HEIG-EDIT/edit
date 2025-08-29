import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  Res,
  UseGuards,
  HttpCode,
  Headers,
  HttpStatus,
  BadRequestException,
} from '@nestjs/common';
import { Response, Request } from 'express';
import { AuthGuard } from '@nestjs/passport';

import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { LogoutDto } from './dto/logout.dto';

import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { ConfigService } from '@nestjs/config';

import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import * as authHelp from '../common/helpers/auth.helpers';

@Controller('auth')
export class AuthController {
  private frontendUrl: string;
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
    private readonly configService: ConfigService,
  ) {
    this.frontendUrl = (
      process.env.NODE_ENV === 'prod'
        ? process.env.PROD_FRONTEND_URL
        : process.env.LOCAL_FRONTEND_URL
    ) as string;
  }

  // ---------------------------------------------------------------
  // Register & Login Endpoints
  // ---------------------------------------------------------------

  //-------------------REGISTER---------------------------------------
  @Post('register')
  async register(@Body() body: RegisterDto) {
    return this.authService.registerUser(body);
  }

  //-------------------LOCAL LOGIN---------------------------------------
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(
    @Body() body: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.authService.loginLocal(body);

    // Set cookies (httpOnly for tokens; device_id readable by FE)
    authHelp.setAuthCookies(res, {
      accessToken: result.accessToken,
      accessTtlSec: result.accessTtlSec,
      refreshToken: result.refreshToken,
      refreshTtlSec: result.refreshTtlSec,
      deviceId: result.deviceId,
    });

    // Return minimal public profile
    return {
      user: result.user,
      message: 'Login successful',
    };
  }

  //-------------------GOOGLE OAUTH2 LOGIN-------------------------------
  /**
   * Login with Google
   * Endpoint to initiate Google OAuth flow.
   * Redirection to Google's authentication page.
   * @returns {void}
   */
  @Get('google')
  @UseGuards(AuthGuard('google'))
  googleLogin() {}

  /**
   * Google OAuth callback
   * Endpoint to handle the callback from Google after user's authentication.
   * Gets the user info from Google and processes login or registration.
   * @param {Request} req - The request object containing user info from Google.
   * @param {Response} res - The response object to set cookies and redirect.
   */
  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  async googleAuthCallback(
    @Req() req: Request & { user: any },
    @Res() res: Response,
  ) {
    const result = await this.authService.providerLogin({
      userInfo: req.user,
      provider: 'google',
    });

    authHelp.setAuthCookies(res, {
      accessToken: result.accessToken,
      accessTtlSec: result.accessTtlSec,
      refreshToken: result.refreshToken,
      refreshTtlSec: result.refreshTtlSec,
      deviceId: result.deviceId,
    });

    // Redirect home (or projects) on your FE
    return res.redirect(this.frontendUrl ?? '/');
  }

  //-------------------LinkedIn OAUTH2 LOGIN-------------------------------
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

  //-------------------Microsoft OAUTH2 LOGIN-------------------------------
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

  // ---------------------------------------------------------------
  //Token Management Endpoints
  // ---------------------------------------------------------------

  // ---------------------------------------------------------------
  //Logout Endpoints
  // ---------------------------------------------------------------

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
    res.clearCookie('access_token', { path: '/' });
    res.clearCookie('refresh_token', { path: '/' });
    res.clearCookie('device_id', { path: '/' });

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

    res.clearCookie('access_token', { path: '/' });
    res.clearCookie('refresh_token', { path: '/' });
    res.clearCookie('device_id', { path: '/' });

    return this.authService.logoutAllDevices(Number(userId));
  }
}
