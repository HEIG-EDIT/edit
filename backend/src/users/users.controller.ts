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
} from '@nestjs/common';
import type { Request } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

import { UsersService } from './users.service';
import { ChangeUsernameDto } from './dto/change-username.dto';
import { ChangeEmailDto } from './dto/change-email.dto';
import { ChangePasswordDto } from './dto/change-password.dto';

@Controller('user')
export class UsersController {
  constructor(private usersService: UsersService) {}

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
  ): Promise<{ message: string }> {
    const userId =
      req.user?.userId ?? req.user?.id ?? req.user?.auth_id ?? undefined;

    if (!userId) {
      throw Object.assign(new Error('Unauthorized'), { status: 401 });
    }

    await this.usersService.changeUserEmail(userId, body.email);
    return { message: 'Email updated successfully' };
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
}
