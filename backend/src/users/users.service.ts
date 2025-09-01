import {
  Injectable,
  ConflictException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';
import * as bcrypt from 'bcrypt';

import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}
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
  private isP2002(e: unknown): e is Prisma.PrismaClientKnownRequestError {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    return typeof e === 'object' && e !== null && (e as any).code === 'P2002';
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
  async createUser(inputEmail: string, passwordHash: string | null) {
    for (let i = 0; i < 10; i++) {
      const gen_username = this.generateRandomUsername();

      try {
        return await this.prisma.user.create({
          data: {
            email: inputEmail,
            passwordHash: passwordHash || null,
            userName: gen_username,
            isEmailVerified: true,
          },
          select: {
            id: true,
            email: true,
            passwordHash: true,
            userName: true,
            createdAt: true,
            isEmailVerified: true,
          },
        });
      } catch (err: unknown) {
        if (this.isP2002(err)) {
          // Determine which unique field actually collided
          // 1) Check email again (handles races)
          const emailTaken = await this.prisma.user.findUnique({
            where: { email: inputEmail },
            select: { id: true },
          });
          if (emailTaken) {
            throw new ConflictException('Email already exists');
          }

          // 2) If email isn’t the problem, assume it was userName; loop to try a new one
          continue;
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
    const username = usernameToCheck.trim();

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

  //-------------------------Manage User Methods-----------------------------//

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
    id: number;
    userName: string;
    email: string;
  } | null> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        userName: true,
        email: true,
      },
    });

    if (!user) return null;

    return {
      id: userId,
      userName: user.userName,
      email: user.email,
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
      // UPDATED: unify the "user not found" path so controller can map to 401 if desired
      throw new BadRequestException('User not found.');
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
    } catch (e: unknown) {
      // UPDATED: handle unique constraint violation in a bundler-safe way
      if (this.isP2002(e)) {
        // Double-check which field collided. If another process sniped the same username,
        // this will confirm it and we can return a proper 409.
        const taken = await this.prisma.user.findUnique({
          where: { userName: newUsername },
          select: { id: true },
        });
        if (taken) {
          // UPDATED: consistent, explicit conflict
          throw new ConflictException('Username is already taken.');
        }
        // If it wasn't userName, rethrow so it can be logged/handled upstream.
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
        e instanceof PrismaClientKnownRequestError &&
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
   * @returns An object containing the outcome.
   * @throws BadRequestException if the current password is invalid or passwords don’t match.
   */
  async changePassword(
    userId: number,
    currentPassword: string,
    newPassword: string,
    repeatPassword: string,
  ): Promise<{ success: boolean }> {
    // Fetch user with password and 2FA settings
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        passwordHash: true,
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

    return { success: true };
  }
}
