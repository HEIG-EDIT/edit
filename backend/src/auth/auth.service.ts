import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
//add ConflictException
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';

import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

import { UsersService } from 'src/users/users.service';
import { EmailService } from '../email/email.service';
import { PrismaService } from '../prisma/prisma.service';

// Utility to hash verification tokens (like passwords)
function sha256Hex(input: string): string {
  return crypto.createHash('sha256').update(input, 'utf8').digest('hex');
}

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
  ) {}

  /**
   * Registers a new user.
   * If the user already exists, it sends an email indicating that the account already exists.
   * If the user does not exist, it creates a new user and sends a verification email.
   * @param dto - The registration data transfer object containing email and password.
   * @returns A message indicating the result of the registration attempt.
   */
  async registerUser(dto: RegisterDto) {
    try {
      const passwordHash = await bcrypt.hash(dto.password, 10);
      const user = await this.userService.createUser(dto.email, passwordHash);

      // Print the user object for debugging purposes
      console.log('Registered user:', user);
      // TODO: put this logic into separate function to use it in other places
      // Generate a verification token
      // IMPORTANT: use a secure random token generator, not just a random string
      const plainToken = crypto.randomBytes(32).toString('hex');
      const tokenHash = sha256Hex(plainToken);
      const expiresAt = new Date(Date.now() + 1000 * 60 * 30); // 30 min

      await this.prisma.emailVerificationToken.create({
        data: { tokenHash, userId: user.id, expiresAt },
      });
      // print the token for debugging purposes
      console.log('Generated verification token:', plainToken);

      // IMPORTANT: link goes to FRONTEND
      const frontendVerifyUrl = `${FRONTEND_BASE_URL}/verify?token=${plainToken}`;
      await this.emailService.sendVerificationEmail(
        user.email,
        frontendVerifyUrl,
      );

      // Print the verification URL for debugging purposes
      console.log('Verification URL sent to user:', frontendVerifyUrl);

      return {
        message: 'If this email is valid, a confirmation has been sent.1',
      };
    } catch (err: any) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      if (err.code === 'P2002') {
        await this.emailService.sendExistingAccountEmail(dto.email);
        return {
          message: 'If this email is valid, a confirmation has been sent.2',
        };
      }
      throw err;
    }
  }

  /**
   * Confirms the user's email address using a verification token.
   * This method checks if the token is valid, not used, and not expired.
   * If valid, it enables the user's account and marks the token as used.
   * @param plainToken - The verification token sent to the user's email.
   * @returns A confirmation message with the user's email.
   */
  async confirmEmail(plainToken: string) {
    if (!plainToken || typeof plainToken !== 'string') {
      throw new BadRequestException('Invalid token');
    }

    const tokenHash = sha256Hex(plainToken);

    const token = await this.prisma.emailVerificationToken.findUnique({
      where: { tokenHash },
      include: { user: true },
    });

    if (!token) throw new ForbiddenException('Invalid or expired token');
    if (token.usedAt) throw new ForbiddenException('Token already used');
    if (token.expiresAt.getTime() < Date.now())
      throw new ForbiddenException('Token expired');

    await this.userService.enableUserAccount(token.user.email);

    await this.prisma.emailVerificationToken.update({
      where: { tokenHash },
      data: { usedAt: new Date() },
    });

    await this.prisma.emailVerificationToken.deleteMany({
      where: { userId: token.userId, usedAt: null },
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

    // 6) Shape response timing to blur residual differences
    const elapsed = Date.now() - start;
    const wait = TIMING_FLOOR_MS + JITTER_MS - elapsed;
    if (wait > 0) await this.sleep(wait);

    // 7) Return generic failure to avoid leaking existence/verification state
    if (!canLogin) {
      // You can standardize on 200 + { success:false } if you prefer.
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
}
