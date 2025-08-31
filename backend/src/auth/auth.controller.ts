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
  UsePipes,
  ValidationPipe,
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
import { Public } from '../common/decorators/public.decorator';
import * as http from '../common/helpers/responses/responses.helper';
import * as authHelp from '../common/helpers/auth.helpers';

@UseGuards(JwtAuthGuard)
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
        ? process.env.FRONTEND_URL_PROD
        : process.env.FRONTEND_URL_LOCAL
    ) as string;
  }

  // ---------------------------------------------------------------
  // Register & Login Endpoints
  // ---------------------------------------------------------------

  //-------------------REGISTER---------------------------------------
  @Public()
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  @Post('register')
  @HttpCode(HttpStatus.OK)
  async register(
    @Body() body: RegisterDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.authService.registerUser(body);

    // 201 Created
    return http.created(res, result, undefined, { noStore: true });
  }

  //-------------------LOCAL LOGIN---------------------------------------
  @Public()
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
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

    // 200 OK response with no-store for auth responses & minimal user info
    return http.ok(
      res,
      { user: result.user, message: 'Login successful' },
      { noStore: true },
    );
  }

  //-------------------GOOGLE OAUTH2 LOGIN-------------------------------
  /**
   * Login with Google
   * Endpoint to initiate Google OAuth flow.
   * Redirection to Google's authentication page.
   * @returns {void}
   */
  @Public()
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
  @Public()
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

    // 303 See Other redirect to frontend
    const target = this.frontendUrl ?? process.env.FRONTEND_URL_PROD ?? '/';
    return http.seeOther(res, target);
  }

  //-------------------LinkedIn OAUTH2 LOGIN-------------------------------
  //TODO
  // Placeholder for LinkedIn login
  @Public()
  @Get('linkedin')
  @UseGuards(AuthGuard('linkedin'))
  linkedinLogin() {}

  //TODO
  // Placeholder for LinkedIn login callback
  @Public()
  @Get('linkedin/callback')
  @UseGuards(AuthGuard('linkedin'))
  async linkedinAuthCallback() {}

  //-------------------Microsoft OAUTH2 LOGIN-------------------------------
  //TODO
  // Placeholder for Microsoft login
  @Public()
  @Get('microsoft')
  @UseGuards(AuthGuard('microsoft'))
  microsoftLogin() {}

  //TODO
  // Placeholder for Microsoft login callback
  @Public()
  @Get('microsoft/callback')
  @UseGuards(AuthGuard('microsoft'))
  async microsoftAuthCallback() {}

  // ---------------------------------------------------------------
  //Token Management Endpoints
  // ---------------------------------------------------------------

  /**
   * POST /auth/refresh
   *
   * Refreshes the access token using a valid refresh token.
   * - Reads refresh token from HttpOnly cookie or Authorization header.
   * - Reads deviceId from `X-Device-Id` header or from cookie as a fallback.
   * - Issues new access and refresh tokens, sets them in cookies.
   */
  @Public()
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refresh(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const refreshToken =
      (req.cookies && (req.cookies['refresh_token'] as string)) ||
      (req as any).signedCookies?.['refresh_token'];

    const deviceId =
      (req.cookies && (req.cookies['device_id'] as string)) ||
      (req.headers['x-device-id'] as string | undefined);

    if (!refreshToken || !deviceId) {
      // Response 401 with WWW-Authenticate
      return http.unauthorized(res, 'Missing refresh token or device id', {
        scheme: 'Bearer',
        error: 'invalid_token',
      });
    }

    const result = await this.authService.refreshTokens({
      refreshToken,
      deviceId,
    });

    // set new cookies (rotated refresh + new access)
    authHelp.setAuthCookies(res, {
      accessToken: result.accessToken,
      accessTtlSec: result.accessTtlSec,
      refreshToken: result.refreshToken,
      refreshTtlSec: result.refreshTtlSec,
      deviceId: result.deviceId,
    });

    // Response standardized 200 OK with no-store
    return http.ok(res, { message: 'Token refreshed' }, { noStore: true });
  }

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
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logout(
    @Req() req: Request & { user?: authHelp.AuthUserShape },
    @Headers('x-device-id') deviceIdHeader: string | undefined,
    @Body() body: LogoutDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<{ message: string }> {
    const userId = authHelp.resolveUserId(req.user);
    if (!userId) {
      // Response 401 Unauthorized with WWW-Authenticate
      return http.unauthorized(res, 'Unauthorized', { scheme: 'Bearer' });
    }

    const deviceId =
      deviceIdHeader ??
      body.deviceId ??
      (req.cookies && (req.cookies['device_id'] as string)) ??
      (req as any).signedCookies?.['device_id'];

    if (!deviceId) {
      // Response 400 Bad Request
      return http.badRequest('Bad request : missing deviceId');
    }

    // When using cookie-based refresh tokens, also clear cookie here:
    res.clearCookie('access_token', { path: '/' });
    res.clearCookie('refresh_token', { path: '/' });
    res.clearCookie('device_id', { path: '/' });

    const out = await this.authService.logoutUser(Number(userId), deviceId);

    // Response 200 OK with no-store
    return http.ok(res, out, { noStore: true });
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
    const userId = authHelp.resolveUserId(req.user);
    if (!userId) {
      // Response 401 Unauthorized with WWW-Authenticate
      return http.unauthorized(res, 'Unauthorized', { scheme: 'Bearer' });
    }

    res.clearCookie('access_token', { path: '/' });
    res.clearCookie('refresh_token', { path: '/' });
    res.clearCookie('device_id', { path: '/' });

    const out = await this.authService.logoutAllDevices(Number(userId));

    // Response 200 OK with no-store
    return http.ok(res, out, { noStore: true });
  }
}
