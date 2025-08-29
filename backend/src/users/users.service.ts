import {
  Injectable,
  ConflictException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';
import * as bcrypt from 'bcrypt';

import { EmailService } from '../email/email.service';
import { conflict } from '../common/helpers/responses/responses.helper';

@Injectable()
export class UsersService {
  constructor(
    private prisma: PrismaService,
    private emailService: EmailService,
  ) {}
  //-------------------Helper Methods---------------------------//
  /**
   * Generates a random username in the format "user_<random_string>".
   * This method is used when creating new users to avoid collisions.
   *
   * @returns A randomly generated username string.
   */
  private generateRandomUsername(): string {
    return `user_${Math.random().toString(36).substring(2, 10)}`;
  }

  //-------------------Auth Methods---------------------------//
  /**
   * Creates a new user in the database.
   *
   * - Retries up to 10 times if a generated username collides with an existing one.
   * - Ensures the email is unique (throws ConflictException if not).
   * - Selects only safe fields to return.
   *
   * @param inputEmail - The email address of the user (must be unique).
   * @param passwordHash - The hashed password of the user.
   * @throws ConflictException if the email already exists or if no unique username could be generated.
   * @returns The newly created user object (id, email, userName, createdAt, isEmailVerified).
   */
  async createUser(inputEmail: string, passwordHash: string) {
    for (let i = 0; i < 10; i++) {
      const gen_username = this.generateRandomUsername();

      try {
        return await this.prisma.user.create({
          data: {
            email: inputEmail,
            passwordHash,
            userName: gen_username,
            isEmailVerified: false,
          },
          select: {
            id: true,
            email: true,
            userName: true,
            createdAt: true,
            isEmailVerified: true,
          },
        });
      } catch (err: unknown) {
        if (
          err instanceof Prisma.PrismaClientKnownRequestError &&
          err.code === 'P2002'
        ) {
          const target = err.meta?.target as string[] | undefined;

          if (target?.includes('userName')) {
            // try again with a new username
            continue;
          }

          if (target?.includes('email')) {
            throw new ConflictException('Email already exists');
          }
        }

        throw err; // rethrow other errors
      }
    }
    throw new ConflictException('Could not generate unique username');
  }

  /**
   * Finds a user by email address.
   *
   * - Returns selected fields (id, email, passwordHash, userName, createdAt, isEmailVerified).
   *
   * @param email - The email address to search for.
   * @returns The user object if found, otherwise null.
   */
  async findUserByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        passwordHash: true,
        userName: true,
        createdAt: true,
        isEmailVerified: true,
      },
    });
  }

  /**
   * Finds a user by username.
   *
   * - Returns selected fields (id, userName, createdAt, isEmailVerified).
   * - Throws BadRequestException if username is empty.
   *
   * @param usernameToCheck - The username to search for.
   * @returns The user object if found, otherwise null.
   */
  async findUserByUsername(usernameToCheck: string) {
    const username =
      typeof usernameToCheck === 'string' ? usernameToCheck.trim() : '';

    if (!username) {
      throw new BadRequestException('Username is required'); // 400
    }

    return this.prisma.user.findUnique({
      where: { userName: username }, // userName is unique
      select: {
        id: true,
        userName: true,
        createdAt: true,
        isEmailVerified: true,
      },
    });
  }

  /**
   * Finds a user by their ID.
   *
   * - Returns selected fields (id, email, userName, createdAt, isEmailVerified).
   *
   * @param userId - The ID of the user to find.
   * @returns The user object if found, otherwise null.
   */
  async findUserById(userId: number) {
    return this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        passwordHash: true, // Include passwordHash for auth purposes
        userName: true,
        createdAt: true,
        isEmailVerified: true,
        refreshToken: true,
      },
    });
  }
  /**
   * Enables a user account after successful email verification.
   *
   * - Finds the user by email.
   * - If the user does not exist, throws BadRequestException.
   * - If already verified, short-circuits.
   * - Otherwise, updates `isEmailVerified` to true.
   *
   * @param email - The email of the user to enable.
   * @throws BadRequestException if no user is found.
   */
  async enableUserAccount(email: string): Promise<void> {
    const user = await this.prisma.user.findUnique({
      where: { email },
      select: { id: true, isEmailVerified: true },
    });

    if (!user) {
      throw new BadRequestException('User not found.');
    }

    // short-circuit if already verified
    if (user.isEmailVerified) {
      return;
    }

    await this.prisma.user.update({
      where: { id: user.id },
      data: { isEmailVerified: true },
    });
  }

  //-------------------------Manage User Methods----------------------------//

  /**
   * Gets the profile info of the given user.
   *
   * - Returns username, email, and 2FA method.
   * - Throws BadRequestException if user not found.
   *
   * @param userId - ID of the authenticated user.
   * @returns Object with userName, email, and twoFaMethod.
   */
  async getUserProfile(userId: number): Promise<{
    userName: string;
    email: string;
    twoFaMethod: string | null;
  } | null> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        userName: true,
        email: true,
        twoFaMethod: true,
      },
    });

    if (!user) return null;

    return {
      userName: user.userName,
      email: user.email,
      twoFaMethod: user.twoFaMethod,
    };
  }

  /**
   * Changes the username of a given user.
   *
   * - Trusts DTO validation for format/length (done at controller).
   * - Short-circuits if the username is unchanged.
   * - Relies on Prisma unique constraint to enforce uniqueness.
   *
   * @param userId - The ID of the user whose username is being changed.
   * @param newUsername - The new username.
   * @throws BadRequestException if the user is not found or if the username is already taken.
   */
  async changeUsername(
    userId: number,
    newUsername: string,
  ): Promise<{ updated: true; userName: string } | { updated: false } | null> {
    const current = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { userName: true },
    });

    if (!current) {
      throw new BadRequestException('User not found.');
    }

    if (!current) {
      // UPDATED: let controller map this to 401 (stale session)
      return null;
    }

    // Short-circuit if unchanged (idempotent)
    if (current.userName === newUsername) {
      return { updated: false };
    }

    try {
      const updated = await this.prisma.user.update({
        where: { id: userId },
        data: { userName: newUsername },
        select: { userName: true },
      });

      return { updated: true, userName: updated.userName };
    } catch (e: any) {
      if (
        e instanceof Prisma.PrismaClientKnownRequestError &&
        e.code === 'P2002' &&
        Array.isArray(e.meta?.target) &&
        e.meta.target.includes('userName')
      ) {
        // Uses centralized helper to keep errors consistent
        conflict('Username is already taken.');
      }
      throw e;
    }
  }

  /**
   * Changes the email address of a given user.
   *
   * - Trusts DTO validation for format (done at controller).
   * - Short-circuits if the email is unchanged.
   * - Relies on Prisma unique constraint to enforce uniqueness.
   *
   * @param userId - The ID of the user whose email is being changed.
   * @param newEmail - The new email address.
   * @returns 'UNCHANGED' if the email is the same, 'CONFLICT' if another user has this email,
   *         'STARTED' if the change was initiated successfully.
   */
  async changeUserEmail(
    userId: number,
    newEmail: string,
  ): Promise<'UNCHANGED' | 'CONFLICT' | 'READY'> {
    const me = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { email: true },
    });
    if (!me) return 'CONFLICT';

    // short-circuit if unchanged
    if (me.email === newEmail) return 'UNCHANGED';

    // Check if another user already uses this email
    const taken = await this.prisma.user.findUnique({
      where: { email: newEmail },
      select: { id: true },
    });
    if (taken && taken.id !== userId) {
      return 'CONFLICT'; // generic message at controller
    }

    try {
      await this.prisma.user.update({
        where: { id: userId },
        data: { email: newEmail, isEmailVerified: false }, // reset verification status
      });
      return 'READY';
    } catch (e: unknown) {
      if (
        e instanceof Prisma.PrismaClientKnownRequestError &&
        e.code === 'P2002' &&
        Array.isArray(e.meta?.target) &&
        e.meta.target.includes('email')
      ) {
        throw new BadRequestException('Email is already taken.');
      }
      throw e;
    }
  }

  /**
   * Retrieves a snapshot of the user's authentication details.
   *
   * - Returns id, email, passwordHash, twoFaMethod, and twoFaSecret.
   * - Used for password change and 2FA validation.
   *
   * @param userId - ID of the user.
   * @returns An object with user auth details or null if not found.
   */
  async getAuthSnapshot(userId: number): Promise<{
    id: number;
    email: string;
    passwordHash: string | null;
    twoFaMethod: string | null;
    twoFaSecret: string | null;
  } | null> {
    return this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        passwordHash: true,
        twoFaMethod: true,
        twoFaSecret: true,
      },
    });
  }

  /**
   * Changes a user's password.
   *
   * - Verifies current password.
   * - Ensures new password and confirmation match.
   * - Hashes and updates the new password.
   * - If 2FA is enabled, returns a flag for the frontend to continue 2FA validation.
   * - Always triggers an email notification in parallel.
   *
   * @param userId - ID of the user.
   * @param currentPassword - The current plain password.
   * @param newPassword - The new plain password.
   * @param repeatPassword - Confirmation of the new password.
   * @returns An object containing the outcome and whether 2FA is required.
   * @throws BadRequestException if the current password is invalid or passwords don’t match.
   */
  async changePassword(
    userId: number,
    currentPassword: string,
    newPassword: string,
    repeatPassword: string,
  ): Promise<{ success: boolean; requires2FA: boolean }> {
    // Fetch user with password and 2FA settings
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        passwordHash: true,
        twoFaMethod: true,
        twoFaSecret: true,
      },
    });

    if (!user || !user.passwordHash) {
      throw new BadRequestException('Invalid user or missing password.');
    }

    // Check current password
    const validPassword = await bcrypt.compare(
      currentPassword,
      user.passwordHash,
    );
    if (!validPassword) {
      throw new ForbiddenException('Current password is incorrect.');
    }

    // Ensure new and repeat match
    if (newPassword !== repeatPassword) {
      throw new BadRequestException(
        'New password and confirmation do not match.',
      );
    }

    // Hash and update new password
    const hashedPassword = await bcrypt.hash(newPassword, 12);
    await this.prisma.user.update({
      where: { id: user.id },
      data: { passwordHash: hashedPassword },
    });

    // Trigger email notification in background
    this.emailService
      .sendPasswordChangeEmail(user.email)
      .catch((err) =>
        console.error('Failed to send password change email', err),
      );

    // If 2FA enabled → signal frontend
    const requires2FA = !!user.twoFaMethod && !!user.twoFaSecret;

    return { success: true, requires2FA };
  }
}
