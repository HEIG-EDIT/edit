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
  UseGuards,
  UsePipes,
  ForbiddenException,
  Param,
  NotFoundException,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

import { UsersService } from './users.service';

import { ChangeUsernameDto } from './dto/change-username.dto';
import { ChangeEmailDto } from './dto/change-email.dto';
import { ChangePasswordDto } from './dto/change-password.dto';

import {
  conflict,
  noContent,
  ok,
  setNoStore,
  unauthorized,
} from '../common/helpers/responses/responses.helper';
import { Public } from '../common/decorators/public.decorator';
import * as authHelp from '../common/helpers/auth.helpers';

@UseGuards(JwtAuthGuard)
@Controller('user')
export class UsersController {
  constructor(private usersService: UsersService) {}

  //--------------------Get User Profile------------------//

  /**
   * GET /user/me
   *
   * Returns the authenticated user's profile information.
   * - Requires JWT authentication.
   * - Provides username, email.
   *
   * @param req - Express request containing authenticated user payload.
   * @param res - Express response to handle errors.
   * @returns User profile information or 401 if not authenticated.
   * @throws 401 if user is not authenticated or token is invalid.
   * @throws 404 if user profile is not found.
   * @throws 200 with user profile information if successful.
   */
  @Get('me')
  async getProfile(
    @Req() req: Request & { user?: authHelp.AuthUserShape },
    @Res({ passthrough: true }) res: Response,
  ): Promise<{ id: number; userName: string; email: string }> {
    setNoStore(res); /// Ensure no caching for this endpoint

    const userId = authHelp.resolveUserId(req.user);

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
   * example: /user/username/alice
   * - 200 OK with public profile info
   * - 400 Bad Request if param is empty/invalid
   * - 404 Not Found if no user matches
   */
  @Public()
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
    @Req() req: Request & { user?: authHelp.AuthUserShape },
    @Res({ passthrough: true }) res: Response,
    @Body() body: ChangeUsernameDto,
  ): Promise<{ userName: string } | void> {
    // Ensure sensitive responses aren't cached
    setNoStore(res);

    // Trust DTO, rely on guard for auth, resolve user id from strategy payload
    const userId = authHelp.resolveUserId(req.user);

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

    if (!result.updated) {
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
    @Req() req: Request & { user?: authHelp.AuthUserShape },
    @Res({ passthrough: true }) res: Response,
    @Body() body: ChangeEmailDto,
  ): Promise<void | { message: string }> {
    setNoStore(res); // No caching sensitive response

    const userId = authHelp.resolveUserId(req.user);

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

    // 200 OK
    return ok(
      res,
      {
        message: 'Address changed successfully.',
      },
      { noStore: true },
    );
  }

  /**
   * POST /user/me/change-password
   *
   * Allows the authenticated user to change their password.
   * - Requires JWT authentication.
   * - Validates request body using ChangePasswordDto.
   * - Returns a message indicating success.
   *
   * @param req - Express request containing the authenticated user.
   * @param dto - DTO containing currentPassword, newPassword, and repeatPassword.
   * @returns Success message.
   */
  @UsePipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
    }),
  )
  @Post('me/change-password')
  async changePassword(
    @Req() req: Request & { user?: authHelp.AuthUserShape },
    @Body() dto: ChangePasswordDto,
  ) {
    const userId = authHelp.resolveUserId(req.user);

    if (!userId) {
      throw Object.assign(new Error('Unauthorized'), { status: 401 });
    }

    await this.usersService.changePassword(
      userId,
      dto.currentPassword,
      dto.newPassword,
      dto.repeatPassword,
    );

    return { message: 'Password changed successfully', twoFA: false };
  }
}
