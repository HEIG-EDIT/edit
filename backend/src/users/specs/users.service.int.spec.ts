import { execSync } from 'child_process';
import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from '../users.service';
import { PrismaService } from '../../prisma/prisma.service';
import {
  ConflictException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';

jest.setTimeout(60000); // allow enough time for docker + db

describe('UsersService (integration)', () => {
  let service: UsersService;
  let prisma: PrismaService;

  beforeAll(async () => {
    // Start Docker container
    execSync('docker compose up -d', { stdio: 'inherit' });

    // Retry db push until ready
    for (let i = 0; i < 10; i++) {
      try {
        execSync('npx prisma db push', { stdio: 'inherit' });
        break;
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (err) {
        console.log(`DB not ready yet, retrying... (${i + 1}/10)`);
        await new Promise((r) => setTimeout(r, 5000));
      }
    }

    const module: TestingModule = await Test.createTestingModule({
      providers: [UsersService, PrismaService],
    }).compile();

    service = module.get<UsersService>(UsersService);
    prisma = module.get<PrismaService>(PrismaService);

    await prisma.$connect();
  });

  beforeEach(async () => {
    // Clean db before each test
    await prisma.user.deleteMany();
  });

  afterAll(async () => {
    await prisma.$disconnect();
    execSync('docker compose down', { stdio: 'inherit' });
  });

  describe('createUser', () => {
    it('should create a user successfully', async () => {
      const user = await service.createUser('john@example.com', 'hashedpass');
      expect(user.email).toBe('john@example.com');
      expect(user.id).toBeDefined();
    });

    it('should throw ConflictException for duplicate email', async () => {
      await service.createUser('dup@example.com', 'hashed');
      await expect(
        service.createUser('dup@example.com', 'hashed'),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('findUserByEmail', () => {
    it('should return user if exists', async () => {
      const created = await service.createUser('jane@example.com', 'secret');
      const found = await service.findUserByEmail('jane@example.com');
      expect(found?.id).toBe(created.id);
    });
  });

  describe('findUserByUsername', () => {
    it('should throw if username is empty', async () => {
      await expect(service.findUserByUsername('   ')).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('changeUsername', () => {
    let userId: number;

    beforeEach(async () => {
      const created = await prisma.user.create({
        data: {
          email: 'user1@test.com',
          userName: 'oldname',
          passwordHash: await bcrypt.hash('secret', 10),
          isEmailVerified: true,
        },
      });
      userId = created.id;
    });

    it('should change username successfully', async () => {
      const result = await service.changeUsername(userId, 'newname');
      expect(result).toEqual({ updated: true, userName: 'newname' });

      const updated = await prisma.user.findUnique({ where: { id: userId } });
      expect(updated?.userName).toBe('newname');
    });

    it('should short-circuit if username unchanged', async () => {
      const result = await service.changeUsername(userId, 'oldname');
      expect(result).toEqual({ updated: false });
    });

    it('should throw BadRequestException if user not found', async () => {
      await expect(service.changeUsername(99999, 'whatever')).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw ConflictException if username already taken', async () => {
      // Create another user with "takenname"
      await prisma.user.create({
        data: {
          email: 'user2@test.com',
          userName: 'takenname',
          passwordHash: await bcrypt.hash('secret', 10),
          isEmailVerified: true,
        },
      });

      // Try to set same username for user1
      await expect(service.changeUsername(userId, 'takenname')).rejects.toThrow(
        ConflictException,
      );
    });
  });

  describe('changeUserEmail', () => {
    let userId: number;

    beforeEach(async () => {
      const created = await prisma.user.create({
        data: {
          email: 'userA@test.com',
          userName: 'userA',
          passwordHash: await bcrypt.hash('secret', 10),
          isEmailVerified: true,
        },
      });
      userId = created.id;
    });

    it('should return UNCHANGED if email is the same', async () => {
      const result = await service.changeUserEmail(userId, 'userA@test.com');
      expect(result).toBe('UNCHANGED');
    });

    it('should return READY and update email if new email is free', async () => {
      const result = await service.changeUserEmail(userId, 'newmail@test.com');
      expect(result).toBe('READY');

      const updated = await prisma.user.findUnique({ where: { id: userId } });
      expect(updated?.email).toBe('newmail@test.com');
      expect(updated?.isEmailVerified).toBe(false); // reset verification
    });

    it('should return CONFLICT if another user already has the email', async () => {
      await prisma.user.create({
        data: {
          email: 'taken@test.com',
          userName: 'otherUser',
          passwordHash: await bcrypt.hash('secret', 10),
          isEmailVerified: true,
        },
      });

      const result = await service.changeUserEmail(userId, 'taken@test.com');
      expect(result).toBe('CONFLICT');
    });

    it('should return CONFLICT if user not found', async () => {
      const result = await service.changeUserEmail(99999, 'whatever@test.com');
      expect(result).toBe('CONFLICT');
    });
  });

  describe('changePassword', () => {
    it('should update password successfully', async () => {
      const hash = await bcrypt.hash('oldPass', 10);
      const created = await prisma.user.create({
        data: {
          email: 'pw@test.com',
          userName: 'pwuser',
          passwordHash: hash,
          isEmailVerified: true,
        },
      });

      const result = await service.changePassword(
        created.id,
        'oldPass',
        'NewPass123!',
        'NewPass123!',
      );

      expect(result.success).toBe(true);

      const updated = await prisma.user.findUnique({
        where: { id: created.id },
      });
      expect(await bcrypt.compare('NewPass123!', updated!.passwordHash!)).toBe(
        true,
      );
    });

    it('should throw ForbiddenException for wrong password', async () => {
      const hash = await bcrypt.hash('oldPass', 10);
      const created = await prisma.user.create({
        data: {
          email: 'wrong@test.com',
          userName: 'wrongpw',
          passwordHash: hash,
          isEmailVerified: true,
        },
      });

      await expect(
        service.changePassword(
          created.id,
          'wrongPass',
          'NewPass123!',
          'NewPass123!',
        ),
      ).rejects.toThrow(ForbiddenException);
    });
  });
});
