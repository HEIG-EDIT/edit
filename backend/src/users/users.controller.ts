// src/user/user.controller.ts
import {
  Controller,
  Get,
  Patch,
  Post,
  Body,
  Req,
  ValidationPipe,
  HttpStatus,
  HttpCode,
  UseGuards,
  UsePipes,
  ForbiddenException,
} from '@nestjs/common';
import type { Request } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PrismaService } from '../prisma/prisma.service';

import { UsersService } from './users.service';
import { TwoFaService } from '../auth/twoFA/twofa.service';
import { TokensService } from '../auth/tokens/tokens.service';
import { EmailService } from '../email/email.service';

import { ChangeUsernameDto } from './dto/change-username.dto';
import { ChangeEmailDto } from './dto/change-email.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { ChangeTwoFaDto } from './dto/change-2fa.dto';

const FRONTEND_BASE_URL = process.env.FRONTEND_URL_LOCAL;

@Controller('user')
export class UsersController {
  constructor(
    private usersService: UsersService,
    private twofaService: TwoFaService,
    private prisma: PrismaService,
    private tokens: TokensService,
    private emailService: EmailService,
  ) {}

  //--------------------Manage User Profile------------------//

  /**
   * GET /user/me
   *
   * Returns the authenticated user's profile information.
   * - Requires JWT authentication.
   * - Provides username, email, and 2FA method.
   *
   * @param req - Express request containing authenticated user payload.
   * @returns Object with profile info.
   */
  @UseGuards(JwtAuthGuard)
  @Get('me')
  async getProfile(
    @Req()
    req: Request & {
      user?: { userId?: number; id?: number; auth_id?: number };
    },
  ): Promise<{ userName: string; email: string; twoFaMethod: string | null }> {
    const userId =
      req.user?.userId ?? req.user?.id ?? req.user?.auth_id ?? undefined;

    if (!userId) {
      throw Object.assign(new Error('Unauthorized'), { status: 401 });
    }

    return await this.usersService.getUserProfile(Number(userId));
  }

  /**
   * PATCH /user/me/username
   *
   * Allows the authenticated user to update their username.
   * - Requires JWT authentication.
   * - Validates request body using ChangeUsernameDto.
   * - Short-circuits if the username is unchanged.
   *
   * @param req - Express request containing the authenticated user.
   * @param body - DTO containing the new username.
   * @returns Success message on update.
   */
  @UseGuards(JwtAuthGuard)
  @UsePipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  )
  @Patch('me/username')
  @HttpCode(HttpStatus.OK)
  async updateUsername(
    @Req()
    req: Request & {
      user?: { userId?: number; id?: number; auth_id?: number; email?: string };
    },
    @Body() body: ChangeUsernameDto,
  ): Promise<{ message: string }> {
    // UPDATED: trust DTO, rely on guard for auth, resolve user id from strategy payload
    const userId =
      req.user?.userId ?? req.user?.id ?? req.user?.auth_id ?? undefined;

    if (!userId) {
      // JwtAuthGuard should prevent this, but just in case
      throw Object.assign(new Error('Unauthorized'), { status: 401 });
    }

    await this.usersService.changeUsername(userId, body.userName);
    return { message: 'Username updated successfully' };
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
   * @param body - DTO containing the new email.
   * @returns Success message on update.
   */
  @UseGuards(JwtAuthGuard)
  @UsePipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  )
  @Patch('me/email')
  @HttpCode(HttpStatus.OK)
  async updateEmail(
    @Req()
    req: Request & {
      user?: { userId?: number; id?: number; auth_id?: number; email?: string };
    },
    @Body() body: ChangeEmailDto,
  ) {
    const userId =
      req.user?.userId ?? req.user?.id ?? req.user?.auth_id ?? undefined;

    if (!userId) {
      throw Object.assign(new Error('Unauthorized'), { status: 401 });
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

    // Clear any previous unused token to avoid unique (userId) conflict
    await this.prisma.emailVerificationToken.deleteMany({
      where: { userId, usedAt: null },
    });

    const { plain, hash, expiresAt } = this.tokens.pair(30 * 60 * 1000);
    await this.prisma.emailVerificationToken.create({
      data: {
        tokenHash: hash,
        userId,
        expiresAt,
      },
    });

    const link = `${FRONTEND_BASE_URL}/verify-email-change?token=${plain}`;
    await this.emailService.sendVerificationEmail(body.email, link);
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
