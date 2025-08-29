import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
  ForbiddenException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';

import { Prisma } from '@prisma/client';

import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

import { UsersService } from '../users/users.service';
import { PrismaService } from '../prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

const DUMMY_BCRYPT_HASH =
  '$2b$12$1w8i2LQyC6z9Yl2wq3FZeu5Vb7J1.2q6oV2Qy1q3bJxJkQe5Lxk1a';

@Injectable()
export class AuthService {
  /**
   *
   * @param userService
   * @param jwtService
   * @param emailService
   * @param prisma
   * @param configService
   */
  constructor(
    private readonly userService: UsersService,
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {}

  // ---------------------------------------------------------------
  //Register & Login Services
  // ---------------------------------------------------------------

  // -------------------REGISTER---------------------------------------
  /**
   * Registers a new user and sends a verification email.
   *
   * Notes:
   * - Handles unique email with a generic response (no account enumeration).
   * - Deletes any previous unused verification token for this user before creating a new one
   *   (your schema uses `userId @unique` on EmailVerificationToken).
   */
  async registerUser(dto: RegisterDto) {
    try {
      const passwordHash = await bcrypt.hash(dto.password, 10);
      const user = await this.userService.createUser(dto.email, passwordHash);

      // Print the user object for debugging purposes
      console.log('Registered user:', user);
      return {
        message: 'Account created successfully, please proceed to login',
      };
    } catch (err: any) {
      if (
        err instanceof ConflictException ||
        (err instanceof Prisma.PrismaClientKnownRequestError &&
          err.code === 'P2002')
      ) {
        return {
          message: 'An account with this email already exists',
        };
      }
      throw err;
    }
  }

  // -------------------LOCAL LOGIN---------------------------------------

  // ---------------------------------------------------------------
  //Token Management Services
  // ---------------------------------------------------------------

  // ---------------------------------------------------------------
  //Logout Services
  // ---------------------------------------------------------------
  /**
   * logs out a user by deleting their refresh token.
   * @param userId - The ID of the user to log out.
   * @param deviceId - The ID of the device to log out from.
   * @throws {NotFoundException} If the refresh token does not exist.
   */
  async logoutUser(
    userId: number | string,
    deviceId: string,
  ): Promise<{ message: string }> {
    // basic input checks (KISS)
    const uid =
      typeof userId === 'string' ? Number.parseInt(userId, 10) : userId;
    if (!Number.isFinite(uid)) {
      throw new BadRequestException('Invalid user id');
    }
    if (!deviceId || typeof deviceId !== 'string') {
      throw new BadRequestException('Invalid device id');
    }

    const result = await this.prisma.refreshToken.deleteMany({
      where: { userId: uid, deviceId },
    });

    if (result.count === 0) {
      throw new NotFoundException('Refresh token not found for this device');
    }

    return { message: 'Logged out successfully' };
  }

  /**
   * Logs out a user from all devices by deleting all their refresh tokens.
   * @param userId - The ID of the user to log out from all devices.
   * @returns An object indicating how many tokens were revoked.
   * @throws {BadRequestException} If the user ID is invalid.
   */
  async logoutAllDevices(
    userId: number | string,
  ): Promise<{ revoked: number }> {
    const uid =
      typeof userId === 'string' ? Number.parseInt(userId, 10) : userId;
    if (!Number.isFinite(uid)) {
      throw new BadRequestException('Invalid user id');
    }
    const result = await this.prisma.refreshToken.deleteMany({
      where: { userId: uid },
    });
    return { revoked: result.count };
  }
}
