import {
  Injectable,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  private generateRandomUsername(): string {
    return `user_${Math.random().toString(36).substring(2, 10)}`;
  }

  async createUser(inputEmail: string, passwordHash: string) {
    for (let i = 0; i < 10; i++) {
      const gen_username = this.generateRandomUsername();
      try {
        return await this.prisma.user.create({
          data: {
            email: inputEmail,
            passwordHash: passwordHash,
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
      } catch (err: any) {
        if (
          err.code === 'P2002' &&
          err.meta?.target?.includes('user_userName_key')
        ) {
          continue; // try again with a new username
        }
        if (
          err.code === 'P2002' &&
          err.meta?.target?.includes('user_email_key')
        ) {
          throw new ConflictException('Email already exists');
        }
        throw err;
      }
    }
    throw new ConflictException('Could not generate unique username');
  }

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

  async enableUserAccount() {}

  async changeUsername(userId: number, newUsername: string): Promise<void> {
    // Check length constraint
    if (newUsername.length > 30) {
      throw new BadRequestException('Username must not exceed 30 characters.');
    }

    // Check uniqueness
    const existingUser = await this.prisma.user.findUnique({
      where: { userName: newUsername },
    });

    if (existingUser && existingUser.id !== userId) {
      throw new BadRequestException('Username is already taken.');
    }

    // Update the username
    await this.prisma.user.update({
      where: { id: userId },
      data: { userName: newUsername },
    });
  }
}
