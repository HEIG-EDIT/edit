import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
  ForbiddenException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
//add ConflictException
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';

import { Prisma } from '@prisma/client';

import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

import { UsersService } from 'src/users/users.service';
import { EmailService } from '../email/email.service';
import { PrismaService } from '../prisma/prisma.service';
import { TwoFaService } from './twoFA/twofa.service';
import { TokensService } from './tokens/tokens.service';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

const FRONTEND_BASE_URL = process.env.FRONTEND_URL_LOCAL;
//const API_BASE_URL = process.env.API_URL_LOCAL;

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
   */
  constructor(
    private readonly userService: UsersService,
    private readonly jwtService: JwtService,
    private readonly emailService: EmailService,
    private readonly prisma: PrismaService,
    private readonly twoFaService: TwoFaService,
    private readonly tokenService: TokensService,
  ) {}

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

      //TODO: This is duplicated in UsersService change email method
      // Remove any stale, unused token to satisfy `userId @unique`
      await this.prisma.emailVerificationToken.deleteMany({
        where: { userId: user.id, usedAt: null },
      });

      const { plain, hash, expiresAt } = this.tokenService.pair(30 * 60 * 1000);

      await this.prisma.emailVerificationToken.create({
        data: { tokenHash: hash, userId: user.id, expiresAt },
      });
      // print the token for debugging purposes
      console.log('Generated verification token:', plain);

      // IMPORTANT: link goes to FRONTEND
      const frontendVerifyUrl = `${FRONTEND_BASE_URL}/verify?token=${plain}`;
      await this.emailService.sendVerificationEmail(
        user.email,
        frontendVerifyUrl,
      );

      if (process.env.NODE_ENV !== 'production') {
        console.log('Verification URL sent to user:', frontendVerifyUrl);
      }

      return {
        message: 'If this email is valid, a confirmation has been sent.1',
      };
    } catch (err: any) {
      if (
        err instanceof ConflictException ||
        (err instanceof PrismaClientKnownRequestError &&
          err.code === 'P2002')
      ) {
        await this.emailService.sendExistingAccountEmail(dto.email);
        return {
          message: 'If this email is valid, a confirmation has been sent.',
        };
      }
      throw err;
    }
  }

  /**
   * Confirms the user's email address using a verification token.
   * - Validates token existence, not-used, not-expired.
   * - Marks the user as verified.
   * - Marks the token as used and deletes other unused tokens for the user.
   * @param plainToken - The verification token sent to the user's email.
   */
  async confirmEmail(plainToken: string) {
    if (!plainToken || typeof plainToken !== 'string') {
      throw new BadRequestException('Invalid token');
    }

    const tokenHash = this.tokenService.sha256Hex(plainToken);

    const token = await this.prisma.emailVerificationToken.findUnique({
      where: { tokenHash },
      include: { user: true },
    });

    if (!token || !token.user)
      throw new ForbiddenException('Invalid or expired token');
    if (token.usedAt) throw new ForbiddenException('Token already used');
    if (token.expiresAt.getTime() < Date.now())
      throw new ForbiddenException('Token expired');

    await this.userService.enableUserAccount(token.user.email);

    await this.prisma.emailVerificationToken.update({
      where: { tokenHash },
      data: { usedAt: new Date() },
    });

    await this.prisma.emailVerificationToken.deleteMany({
      where: { userId: token.userId },
    });

    return { email: token.user.email };
  }

  /**
   * Logs in a user.
   * This method checks the user's credentials and generates an access token if they are valid.
   * - Always runs exactly one bcrypt.compare (dummy on unknown users)
   * - Applies a timing floor + jitter
   * - Returns generic failures (no “unverified” vs “invalid” split)
   * - Issues refresh token only on successful & verified login
   * @param dto - The login data transfer object containing email and password.
   */
  async loginUser(dto: LoginDto) {
    const start = Date.now();
    const TIMING_FLOOR_MS = 500; // floor to blur DB/cache noise
    const JITTER_MS = Math.floor(Math.random() * 150); // small randomness

    // 1) Fetch user who might exist (or not)
    const user = await this.userService.findUserByEmail(dto.email);

    // 2) Pick real vs dummy hash, then always runs exactly ONE compare
    const hashToCheck = user?.passwordHash ?? DUMMY_BCRYPT_HASH;
    const passwordOk = await bcrypt.compare(dto.password, hashToCheck);

    // 3) Decide if sign-in is allowed (user exists, pw ok, AND email is verified)
    const canLogin = Boolean(user && passwordOk && user.isEmailVerified);

    // 4) If user exists but is NOT verified, silently re-send verify email
    //    NO await here; keep timing consistent with failures.
    // if (user && passwordOk && !user.isEmailVerified) {
    //   void this.emailService.sendVerificationEmail(user.email, url).catch(() => void 0);
    // }

    let accessToken: string | null = null;
    let refreshPlain: string | null = null;
    let deviceId: string | null = null;

    if (canLogin) {
      // 5) Issue tokens (only on verified success)
      const payload = { sub: user!.id, email: user!.email };
      accessToken = await this.jwtService.signAsync(payload); // short-lived

      // Refresh token: created on first real successful login (bind to device) --> Avoid generating useless tokens for unverified users
      deviceId = crypto.randomUUID();
      refreshPlain = crypto.randomBytes(32).toString('hex');
      const refreshHash = crypto
        .createHash('sha256')
        .update(refreshPlain)
        .digest('hex');

      const refreshExpiresAt = new Date(
        Date.now() + 1000 * 60 * 60 * 24 * 30, // 30d
      );

      await this.prisma.refreshToken.create({
        data: {
          tokenHash: refreshHash,
          deviceId,
          oauthProvider: 'local',
          expiresAt: refreshExpiresAt,
          userId: user!.id,
        },
      });
    }

    // 6) Timing floor + jitter
    const elapsed = Date.now() - start;
    const wait = TIMING_FLOOR_MS + JITTER_MS - elapsed;
    if (wait > 0) await this.sleep(wait);

    // 7) Return generic failure to avoid leaking existence/verification state
    if (!canLogin) {
      // can standardize on 200 + { success:false } if prefered.
      throw new UnauthorizedException('Invalid credentials');
    }

    // 8) Success: return tokens & minimal user info
    return {
      accessToken,
      refreshToken: refreshPlain, // In prod: set as HttpOnly+Secure cookie, not JSON
      deviceId,
      user: { id: user!.id, email: user!.email, userName: user!.userName },
    };
  }

  /**
   * Helper function to normalize total wait time.
   * @param ms
   * @private
   */
  private sleep(ms: number) {
    return new Promise((r) => setTimeout(r, ms));
  }

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
