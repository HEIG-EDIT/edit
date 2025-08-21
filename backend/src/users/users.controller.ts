// src/user/user.controller.ts
import {
  Controller,
  Get,
  Patch,
  Post,
  Body,
  Req,
  Res,
  ValidationPipe,
  HttpStatus,
  HttpCode,
  UseGuards,
  UsePipes,
  ForbiddenException,
  Param,
  NotFoundException,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { PrismaService } from '../prisma/prisma.service';

import { UsersService } from './users.service';
import { TwoFaService } from '../auth/twoFA/twofa.service';
import { TokensService } from '../auth/tokens/tokens.service';
import { EmailService } from '../email/email.service';
import { AuthService } from '../auth/auth.service';

import { ChangeUsernameDto } from './dto/change-username.dto';
import { ChangeEmailDto } from './dto/change-email.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { ChangeTwoFaDto } from './dto/change-2fa.dto';

import {
  conflict,
  noContent,
  ok,
  setNoStore,
  unauthorized,
} from '../common/helpers/responses/responses.helper';

const FRONTEND_BASE_URL = process.env.FRONTEND_URL_LOCAL;

@Controller('user')
export class UsersController {
  constructor(
    private usersService: UsersService,
    private twofaService: TwoFaService,
    private prisma: PrismaService,
    private tokens: TokensService,
    private emailService: EmailService,
    private authService: AuthService,
  ) {}

  //--------------------Get User Profile------------------//

  /**
   * GET /user/me
   *
   * Returns the authenticated user's profile information.
   * - Requires JWT authentication.
   * - Provides username, email, and 2FA method.
   *
   * @param req - Express request containing authenticated user payload.
   * @param res - Express response to handle errors.
   * @returns User profile information or 401 if not authenticated.
   * @throws 401 if user is not authenticated or token is invalid.
   * @throws 404 if user profile is not found.
   * @throws 200 with user profile information if successful.
   */
  @UseGuards(JwtAuthGuard)
  @Get('me')
  async getProfile(
    @Req()
    req: Request & {
      user?: { userId?: number; id?: number; auth_id?: number };
    },
    @Res({ passthrough: true }) res: Response,
  ): Promise<{ userName: string; email: string; twoFaMethod: string | null }> {
    setNoStore(res); /// Ensure no caching for this endpoint

    const userId = req.user?.userId ?? req.user?.id ?? req.user?.auth_id;

    if (!userId) {
      // Standard 401 with auth header
      return unauthorized(res);
    }

    const profile = await this.usersService.getUserProfile(Number(userId));
    if (!profile) {
      // Stale/invalid session → 401 opaque
      return unauthorized(res, 'Authentication required', {
        error: 'invalid_token',
      });
    }

    // 200 OK with user profile --> note: this profile does not include sensitive data like password hash
    return ok(res, profile);
  }

  /**
   * GET /user/username/:username
   *
   * - 200 OK with public profile info
   * - 400 Bad Request if param is empty/invalid
   * - 404 Not Found if no user matches
   */
  @Get('username/:username')
  async getProfileByUsername(
    @Param('username') username: string,
    @Res({ passthrough: true }) res: Response,
  ) {
    setNoStore(res); // Don’t cache user profile responses

    const profile = await this.usersService.findUserByUsername(username);

    if (!profile) {
      throw new NotFoundException('User not found'); // 404
    }

    // 200 OK
    return ok(res, profile);
  }

  //--------------------Update User Profile------------------//
  /**
   * PATCH /user/me/username
   *
   * Allows the authenticated user to update their username.
   * - Requires JWT authentication.
   * - Validates request body using ChangeUsernameDto.
   * - Short-circuits if the username is unchanged.
   *
   * @param req - Express request containing the authenticated user.
   * @param res - Express response to handle errors and set cache headers.
   * @param body - DTO containing the new username.
   * @returns Updated username or no content if unchanged.
   * @throws 401 if user is not authenticated or token is invalid.
   * @throws 422 if validation fails.
   * @throws 204 if the username is unchanged (idempotent no-op).
   * @throws 200 with updated username if successful.
   */
  @UseGuards(JwtAuthGuard)
  @UsePipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
    }),
  )
  @Patch('me/username')
  async updateUsername(
    @Req()
    req: Request & {
      user?: { userId?: number; id?: number; auth_id?: number; email?: string };
    },
    @Res({ passthrough: true }) res: Response,
    @Body() body: ChangeUsernameDto,
  ): Promise<{ userName: string } | void> {
    // Ensure sensitive responses aren't cached
    setNoStore(res);

    // UPDATED: trust DTO, rely on guard for auth, resolve user id from strategy payload
    const userId =
      req.user?.userId ?? req.user?.id ?? req.user?.auth_id ?? undefined;

    if (!userId) {
      // Shouldn't happen with JwtAuthGuard, but just in case
      return unauthorized(res);
    }

    const result = await this.usersService.changeUsername(
      userId,
      body.userName,
    );

    if (result === null) {
      // Stale token or deleted account → opaque 401
      return unauthorized(res, 'Authentication required', {
        error: 'invalid_token',
      });
    }

    if (result.updated === false) {
      // Idempotent no-op → 204
      return noContent(res);
    }

    // 200 OK with updated field
    return ok(res, { userName: result.userName });
  }

  /**
   * PATCH /user/me/email
   *
   * Allows the authenticated user to update their email address.
   * - Requires JWT authentication.
   * - Validates request body using ChangeEmailDto.
   * - Short-circuits if the email is unchanged.
   *
   * @param req - Express request containing the authenticated user.
   * @param res - Express response to handle errors and set cache headers.
   * @param body - DTO containing the new email.
   * @returns Success message on update.
   *
   * @throws 401 if user is not authenticated or token is invalid.
   * @throws 409 if the email is already in use by another user.
   * @throws 403 if the user is trying to change email on an OAuth-only account.
   * @throws 202 if the email change process has started and a verification email is sent
   * @thros 204 if the email is unchanged (idempotent no-op).
   */
  @UseGuards(JwtAuthGuard)
  @UsePipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
    }),
  )
  @Patch('me/email')
  async updateEmail(
    @Req()
    req: Request & {
      user?: { userId?: number; id?: number; auth_id?: number; email?: string };
    },
    @Res({ passthrough: true }) res: Response,
    @Body() body: ChangeEmailDto,
  ): Promise<void | { message: string }> {
    setNoStore(res); // No caching sensitive response

    const userId =
      req.user?.userId ?? req.user?.id ?? req.user?.auth_id ?? undefined;

    if (!userId) return unauthorized(res);

    const me = await this.usersService.getAuthSnapshot(userId);
    if (me?.passwordHash == null) {
      // 403 Provider OAuth account cannot change email
      throw new ForbiddenException(
        'Email change not available for this account',
      );
    }

    // check if regirster with Oauth Provider if yes, throw error
    const user = await this.usersService.findUserById(Number(userId));
    if (!user) {
      throw Object.assign(new Error('User not found'), { status: 404 });
    }
    if (user.passwordHash == null) {
      // OAuth-only account (no local password set)
      throw new ForbiddenException(
        'Cannot change email for OAuth-only accounts',
      );
    }

    // Staged email change
    const started = await this.usersService.changeUserEmail(userId, body.email);
    if (started === 'CONFLICT') {
      // 409 --> Generic message to avoid enumerating other users’ emails
      return conflict('Cannot use this email.');
    }

    if (started === 'UNCHANGED') {
      return noContent(res); // 204
    }

    // if started = 'SATARTED' creat verification token and send email
    // Clear any previous unused token to avoid unique (userId) conflict
    await this.prisma.emailVerificationToken.deleteMany({
      where: { userId, usedAt: null },
    });

    const { plain, hash, expiresAt } = this.tokens.pair(30 * 60 * 1000);

    await this.prisma.emailVerificationToken.create({
      data: { tokenHash: hash, userId, expiresAt },
    });

    const link = `${FRONTEND_BASE_URL}/verify-email?token=${plain}`;
    await this.emailService.sendVerificationEmail(body.email, link);

    // send email in previous email to inform user about email change in case they did not request it
    await this.emailService.sendEmailChangeEmail(body.email);

    // 202 Accepted: process started, email sent to new address
    res.status(202);
    return { message: 'If the address is valid, we sent a confirmation link.' };
  }

  /**
   * POST /user/me/change-password
   *
   * Allows the authenticated user to change their password.
   * - Requires JWT authentication.
   * - Validates request body using ChangePasswordDto.
   * - Returns a message indicating success or if 2FA is required.
   *
   * @param req - Express request containing the authenticated user.
   * @param dto - DTO containing currentPassword, newPassword, and repeatPassword.
   * @returns Success message or 2FA requirement status.
   */
  @Post('me/change-password')
  @UseGuards(JwtAuthGuard)
  async changePassword(
    @Req()
    req: Request & {
      user?: { userId?: number; id?: number; auth_id?: number; email?: string };
    },
    @Body() dto: ChangePasswordDto,
  ) {
    const userId =
      req.user?.userId ?? req.user?.id ?? req.user?.auth_id ?? undefined;

    if (!userId) {
      throw Object.assign(new Error('Unauthorized'), { status: 401 });
    }
    const result = await this.usersService.changePassword(
      userId,
      dto.currentPassword,
      dto.newPassword,
      dto.repeatPassword,
    );

    if (result.requires2FA) {
      return { message: 'Password changed, 2FA required', twoFA: true };
    }

    return { message: 'Password changed successfully', twoFA: false };
  }

  //--------------------Manage Two-Factor Authentication------------------//
  /**
   * POST /user/me/2fa/start
   *
   * Starts a 2FA challenge:
   *  - enable2fa: begin enabling a method (totp/email/sms)
   *  - disable2fa: begin disabling current 2FA (verifies ownership)
   *
   * Returns: { twofaToken, method, expiresAt, otpauthUrl?, secretBase32? }
   */
  @UseGuards(JwtAuthGuard)
  @UsePipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  )
  @Post('me/2fa/start')
  @HttpCode(HttpStatus.OK)
  async startTwoFa(
    @Req()
    req: Request & {
      user?: { userId?: number; id?: number; auth_id?: number };
    },
    @Body() body: ChangeTwoFaDto,
  ): Promise<{
    twofaToken: string;
    method: 'totp' | 'email' | 'sms';
    expiresAt: Date;
    otpauthUrl?: string;
    secretBase32?: string;
  }> {
    const userId = req.user?.userId ?? req.user?.id ?? req.user?.auth_id;
    if (!userId)
      throw Object.assign(new Error('Unauthorized'), { status: 401 });

    return this.twofaService.startChallenge(
      Number(userId),
      body.action,
      body.method,
    );
  }
}
