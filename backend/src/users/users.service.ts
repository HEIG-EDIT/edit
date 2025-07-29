import { Injectable, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  private generateRandomUsername(): string {
    return `user_${Math.random().toString(36).substring(2, 10)}`;
  }

  async createUser(dto: CreateUserDto) {
    const passwordHash = await bcrypt.hash(dto.password, 10);

    let gen_username = '';
    let unique = false;

    // Retry generating username until unique
    for (let i = 0; i < 10; i++) {
      gen_username = this.generateRandomUsername();

      console.log(`🔍 Checking username: ${gen_username}`);

      const exists = await Promise.race([
        this.prisma.user.findFirst({ where: { userName: gen_username } }),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error('DB query timeout')), 5000)
        ),
      ]);

      if (!exists) {
        console.log(`✅ Username available: ${gen_username}`);
        unique = true;
        break;
      }
    }

    if (!unique) {
      throw new ConflictException('Could not generate unique username');
    }

    try {
      return await this.prisma.user.create({
        data: {
          email: dto.email,
          passwordHash,
          userName: gen_username,
          isEmailVerified: false,
        },
        select: {
          id: true,
          email: true,
          userName: true,
          createdAt: true,
        },
      });
    } catch (err) {
      if (err.code === 'P2002') {
        throw new ConflictException('Email already exists');
      }
      throw err;
    }
  }
}
