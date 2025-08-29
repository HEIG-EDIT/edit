import {
  Injectable,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import * as crypto from 'crypto';
import { authenticator } from 'otplib';

// Simple union types (easy to read & autocomplete)
export type TwoFaAction =
  | 'enable2fa'
  | 'disable2fa'
  | 'login'
  | 'changePassword'
  | 'passwordRecovery';
export type TwoFaMethod = 'totp' | 'email';

@Injectable()
export class TwoFaService {
  constructor(private readonly prisma: PrismaService) {}

  // --- helpers (private, no-any) ---
  private randomToken(bytes = 32): string {
    return crypto.randomBytes(bytes).toString('base64url');
  }
  private sha256Hex(input: string): string {
    return crypto.createHash('sha256').update(input).digest('hex');
  }
  private generateNumericCode(length = 6): string {
    const min = 10 ** (length - 1);
    const max = 10 ** length - 1;
    return String(Math.floor(min + Math.random() * (max - min + 1)));
  }

  /**
   * Start a 2FA challenge.
   * - For enable(TOTP): generates provisional secret + otpauth URL (for QR)
   * - For disable(TOTP): verify against existing secret later
   * - For email/sms: generates a one-time code (you send it out)
   *
   * Returns a public `twofaToken` you must send back on verify.
   */
  async startChallenge(
    userId: number,
    action: TwoFaAction,
    method?: TwoFaMethod,
  ): Promise<{
    twofaToken: string;
    method: TwoFaMethod;
    expiresAt: Date;
    otpauthUrl?: string;
    secretBase32?: string;
  }> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        email: true,
        userName: true,
        twoFaMethod: true,
        twoFaSecret: true,
      },
    });
    if (!user) throw new BadRequestException('User not found.');

    const resolvedMethod: TwoFaMethod =
      action === 'enable2fa'
        ? (method ?? 'totp')
        : (method ?? (user.twoFaMethod as TwoFaMethod | null) ?? 'totp');

    const token = this.randomToken(32);
    const tokenHash = this.sha256Hex(token);
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 min
    let otpauthUrl: string | undefined;
    let secretBase32: string | undefined;
    let secretToStore: string | undefined;
    let codeHashToStore: string | undefined;

    if (resolvedMethod === 'totp' && action === 'enable2fa') {
      secretBase32 = authenticator.generateSecret();
      otpauthUrl = authenticator.keyuri(
        user.email ?? user.userName,
        'YourApp',
        secretBase32,
      );
      secretToStore = secretBase32;
    } else if (resolvedMethod === 'email') {
      const code = this.generateNumericCode(6);
      codeHashToStore = this.sha256Hex(code);

      // TODO: send the code via email/SMS provider
      // await this.mailer.sendTwoFaCode(user.email, code);
      console.log(`2FA code for ${user.email}: ${code}`);
    }

    await this.prisma.twoFaChallenge.create({
      data: {
        tokenHash,
        userId,
        action,
        method: resolvedMethod,
        secret: secretToStore ?? null,
        codeHash: codeHashToStore ?? null,
        expiresAt,
      },
    });

    return {
      twofaToken: token,
      method: resolvedMethod,
      expiresAt,
      otpauthUrl,
      secretBase32,
    };
  }

  /**
   * Verify a 2FA challenge and apply enable/disable effects.
   * - EMAIL/SMS: compare sha256(code) with stored hash
   * - TOTP enable: verify against provisional secret then save it to the user
   * - TOTP disable/step-up: verify against user's current secret
   */
  async verifyChallenge(
    userId: number,
    twofaToken: string,
    code: string,
  ): Promise<{ success: true; action: TwoFaAction; method: TwoFaMethod }> {
    if (!twofaToken || !code)
      throw new BadRequestException('Missing 2FA token or code.');
    const tokenHash = this.sha256Hex(twofaToken);

    const challenge = await this.prisma.twoFaChallenge.findUnique({
      where: { tokenHash },
      include: { user: true },
    });
    if (!challenge || challenge.userId !== userId)
      throw new ForbiddenException('Invalid 2FA token.');
    if (challenge.usedAt || challenge.verifiedAt)
      throw new ForbiddenException('2FA token already used.');
    if (challenge.expiresAt.getTime() < Date.now())
      throw new ForbiddenException('2FA token expired.');

    const method = challenge.method as TwoFaMethod;
    const action = challenge.action as TwoFaAction;

    let ok = false;
    if (method === 'email') {
      ok = !!challenge.codeHash && this.sha256Hex(code) === challenge.codeHash;
    } else if (method === 'totp') {
      if (action === 'enable2fa') {
        if (!challenge.secret)
          throw new BadRequestException('Missing TOTP secret.');
        ok = authenticator.check(code, challenge.secret);
      } else {
        if (!challenge.user.twoFaSecret)
          throw new BadRequestException('TOTP not set for this user.');
        ok = authenticator.check(code, challenge.user.twoFaSecret);
      }
    }
    if (!ok) throw new ForbiddenException('Invalid 2FA code.');

    // mark used
    await this.prisma.twoFaChallenge.update({
      where: { tokenHash },
      data: { verifiedAt: new Date(), usedAt: new Date() },
    });

    // apply enable/disable side-effects
    if (action === 'enable2fa') {
      if (method === 'totp') {
        await this.prisma.user.update({
          where: { id: userId },
          data: { twoFaMethod: 'totp', twoFaSecret: challenge.secret },
        });
      } else {
        await this.prisma.user.update({
          where: { id: userId },
          data: { twoFaMethod: method, twoFaSecret: null },
        });
      }
    } else if (action === 'disable2fa') {
      await this.prisma.user.update({
        where: { id: userId },
        data: { twoFaMethod: null, twoFaSecret: null },
      });
    }

    return { success: true, action, method };
  }
}
