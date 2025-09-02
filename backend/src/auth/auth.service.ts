import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';

import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

import { UsersService } from '../users/users.service';
import { PrismaService } from '../prisma/prisma.service';
import { TokensService } from './tokens/tokens.service';

import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

const ACCESS_TTL_SEC = Number(process.env.ACCESS_TOKEN_TTL_SEC || 15 * 60); // 15 min
const REFRESH_TTL_SEC = Number(
  process.env.REFRESH_TOKEN_TTL_SEC || 30 * 24 * 3600,
); // 30 days
const DUMMY_BCRYPT_HASH =
  '$2b$12$1w8i2LQyC6z9Yl2wq3FZeu5Vb7J1.2q6oV2Qy1q3bJxJkQe5Lxk1a';

/*
 * AuthService
 * - local registration & login
 * - OAuth login (Google, Microsoft, LinkedIn)
 * - JWT access tokens
 * - refresh tokens (with device binding)
 * - logout (single device or all)
 */
@Injectable()
export class AuthService {
  /**
   *
   * @param userService
   * @param jwtService
   * @param prisma
   * @param tokensService
   */
  constructor(
    private readonly userService: UsersService,
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService,
    private readonly tokensService: TokensService,
  ) {}

  // ---------------------------------------------------------------
  //Register & Login Services
  // ---------------------------------------------------------------

  // -------------------REGISTER---------------------------------------
  /**
   * Registers a new user
   *
   * Notes:
   * - Handles unique email with a generic response (no account enumeration).
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
        (err instanceof PrismaClientKnownRequestError && err.code === 'P2002')
      ) {
        return {
          message: 'An account with this email already exists',
        };
      }
      throw err;
    }
  }

  // -------------------LOCAL LOGIN---------------------------------------
  /**
   * Logs in a user.
   * This method checks the user's credentials and generates an access token if they are valid.
   * - Always runs exactly one bcrypt.compare (dummy on unknown users)
   * - Applies a timing floor + jitter
   * - Returns generic failures (no “unverified” vs “invalid” split)
   * - Issues refresh token only on successful & verified login
   * @param dto - The login data transfer object containing email and password.
   */
  async loginLocal(dto: LoginDto) {
    const start = Date.now();
    const TIMING_FLOOR_MS = 500; // floor to blur DB/cache noise
    const JITTER_MS = Math.floor(Math.random() * 150); // small randomness

    // 1) Look up user by email (or undefined)
    const user = await this.userService.findUserByEmail(dto.email);

    // 2) Exactly one compare
    const hashToCheck = user?.passwordHash ?? DUMMY_BCRYPT_HASH;
    const passwordOk = await bcrypt.compare(dto.password, hashToCheck);

    // 3) Decide if sign-in is allowed (user exists, pw ok)
    const canLogin = Boolean(user && passwordOk);
    let access: { token: string; ttlSec: number } | null = null;
    let refresh: { plain: string; ttlSec: number; deviceId: string } | null =
      null;

    const deviceId = crypto.randomUUID();
    if (canLogin) {
      // 4) Issue tokens (only on verified success)
      access = await this.issueAccessToken({
        id: user!.id,
        email: user!.email,
      });
      // Refresh token: created on first real successful login (bind to device)
      // --> Avoid generating useless tokens for unverified users
      refresh = await this.mintRefreshToken({
        userId: user!.id,
        provider: 'local',
        deviceId,
      });
    }

    // 5) Timing floor + jitter
    const elapsed = Date.now() - start;
    const wait = TIMING_FLOOR_MS + JITTER_MS - elapsed;
    if (wait > 0) await new Promise((r) => setTimeout(r, wait));

    if (!canLogin) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // 7) Success: return tokens & minimal user info
    return {
      accessToken: access!.token,
      accessTtlSec: access!.ttlSec,
      refreshToken: refresh!.plain,
      refreshTtlSec: refresh!.ttlSec,
      deviceId: refresh!.deviceId,
      user: { id: user!.id, email: user!.email, userName: user!.userName },
    };
  }

  //--------------Providers Login---------------------------------------
  /**
   * Use this for Google/Microsoft/LinkedIn callbacks:
   * - find or create user by email
   * - issue tokens the same way
   */
  async providerLogin(params: {
    userInfo: any;
    provider: 'google' | 'microsoft' | 'linkedin';
  }) {
    // Ensure user exists (create minimal account if necessary)
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment,@typescript-eslint/no-unsafe-member-access
    const email = params.userInfo.email;
    let user = await this.userService.findUserByEmail(email);
    if (!user) {
      // Create a minimal user with a random username (your UsersService likely has a method)
      user = await this.userService.createUser(email, null);
    }

    const access = await this.issueAccessToken({
      id: user.id,
      email: user.email,
    });
    const refresh = await this.mintRefreshToken({
      userId: user.id,
      provider: params.provider,
    });

    return {
      accessToken: access.token,
      accessTtlSec: access.ttlSec,
      refreshToken: refresh.plain,
      refreshTtlSec: refresh.ttlSec,
      deviceId: refresh.deviceId,
      user: { id: user.id, email: user.email, userName: user.userName },
    };
  }

  // ---------------------------------------------------------------
  //Token Management Services
  // ---------------------------------------------------------------

  /**
   * Create a short-lived JWT access token.
   * @param user - The user object containing at least `id` and `email`.
   * @returns An object containing the access token and its TTL in seconds.
   */
  async issueAccessToken(user: { id: number; email: string }) {
    const payload = { sub: user.id, email: user.email };
    const token = await this.jwtService.signAsync(payload);
    return { token, ttlSec: ACCESS_TTL_SEC };
  }

  /**
   * Create & persist a refresh token bound to a device.
   * Returns the plain token (for cookie) and deviceId.
   * @param params - Parameters for minting the refresh token.
   * @returns An object containing the plain refresh token, its TTL in seconds,
   * and the device ID.
   */
  async mintRefreshToken(params: {
    userId: number;
    provider: 'local' | 'google' | 'microsoft' | 'linkedin';
    deviceId?: string;
  }) {
    const deviceId = params.deviceId ?? crypto.randomUUID();

    // generate a random token, store only its hash
    const { plain, hash, expiresAt } = this.tokensService.pair(
      REFRESH_TTL_SEC * 1000,
    );

    await this.prisma.refreshToken.create({
      data: {
        tokenHash: hash,
        deviceId,
        oauthProvider: params.provider,
        expiresAt,
        userId: params.userId,
      },
    });

    return {
      plain, // send to client
      ttlSec: REFRESH_TTL_SEC,
      deviceId, // for cookie
    };
  }

  // -------------------REFRESH LOGIC------------------------------------
  /**
   * Refreshes the access token using a valid refresh token.
   * - Validates the refresh token against the stored hash and device ID.
   * - Checks for token expiry and user existence.
   * - Issues a new access token and rotates the refresh token.
   * @param params - An object containing the refresh token and device ID.
   * @returns An object containing the new access token, its TTL, the new refresh token,
   * its TTL, and the device ID.
   * @throws {UnauthorizedException} If the refresh token is invalid or expired,
   * or if the user is not found.
   */
  async refreshTokens(params: { refreshToken: string; deviceId: string }) {
    const { refreshToken, deviceId } = params;

    // 1) Find the stored refresh token by hash + device
    const tokenHash = this.tokensService.sha256Hex(refreshToken);
    const record = await this.prisma.refreshToken.findFirst({
      where: { tokenHash, deviceId },
      select: { id: true, userId: true, oauthProvider: true, expiresAt: true },
    });

    if (!record) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    // 2) Check expiry
    if (record.expiresAt <= new Date()) {
      // cleanup
      await this.prisma.refreshToken.delete({ where: { id: record.id } });
      throw new UnauthorizedException('Refresh token expired');
    }

    // 3) Load user
    const user = await this.prisma.user.findUnique({
      where: { id: record.userId },
      select: { id: true, email: true },
    });
    if (!user) {
      await this.prisma.refreshToken.delete({ where: { id: record.id } });
      throw new UnauthorizedException('User not found for token');
    }

    // 4) New access token
    const access = await this.issueAccessToken({
      id: user.id,
      email: user.email,
    });

    // 5) Rotate refresh token
    const { plain, hash, expiresAt } = this.tokensService.pair(
      REFRESH_TTL_SEC * 1000,
    );

    await this.prisma.$transaction([
      this.prisma.refreshToken.delete({ where: { id: record.id } }),
      this.prisma.refreshToken.create({
        data: {
          tokenHash: hash,
          deviceId,
          oauthProvider: record.oauthProvider,
          expiresAt,
          userId: user.id,
        },
      }),
    ]);

    return {
      accessToken: access.token,
      accessTtlSec: access.ttlSec,
      refreshToken: plain,
      refreshTtlSec: REFRESH_TTL_SEC,
      deviceId,
    };
  }

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
