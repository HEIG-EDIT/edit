
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { UsersService } from '../users.service';
import { execSync } from 'child_process';
import { PrismaClient } from '@prisma/client';

describe('UserService Integration', () => {
  let app: INestApplication;
  let userService: UsersService;
  let prisma: PrismaClient;

  // Start Docker Compose before all tests
  beforeAll(async () => {
    console.log('🟡 Starting docker containers...');
    execSync('docker compose up -d', { stdio: 'inherit' });

    // Wait for DB to be ready
    console.log('⏳ Waiting for database to be ready...');
    await new Promise((res) => setTimeout(res, 15000)); 

    console.log('📐 Pushing Prisma schema...');
    execSync('npx prisma db push', {
      stdio: 'inherit'
    });

    const moduleFixture: TestingModule = await Test.createTestingModule({
      providers: [UsersService, PrismaService],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    userService = moduleFixture.get<UsersService>(UsersService);
    prisma = moduleFixture.get<PrismaService>(PrismaService);
  }, 30000);

  // Clean up users created during tests
  afterAll(async () => {
    await app.close();

    console.log('🔴 Stopping docker containers...');
    execSync('docker compose down', { stdio: 'inherit' });
  });

  describe('createUser()', () => {
    const testEmails = ['unique@example.com', 'duplicate@example.com'];

    afterAll(async () => {
      await prisma.user.deleteMany({
        where: {
          email: {
            in: testEmails,
          },
        },
      });
    });
    
    // Test duplicate email behavior
    it('should throw ConflictException if email already exists', async () => {
      // Create user first
      await userService.createUser('duplicate@example.com','password123');

      // Try again with same email
      await expect(
        userService.createUser('duplicate@example.com', 'password123')
      ).rejects.toThrow('Email already exists');  
    });

    // Test user creation with a unique email
    it('should create a user with unique email and random username', async () => {
      const email = 'unique@example.com'
      const password = 'password123'
      const user = await userService.createUser(email, password);

      expect(user.email).toBe(email);
      expect(user.userName).toMatch(/^user_/);
      expect(user.id).toBeDefined();
      expect(user.createdAt).toBeDefined();
    });
  });

  describe('changeUsername()', () => {
    let user1Id: number;
    let user2Id: number;

    beforeAll(async () => {
      const user1 = await prisma.user.create({
        data: {
          email: 'test1@example.com',
          passwordHash: 'hashedpass1',
          userName: 'initial_user1',
          isEmailVerified : false,
        },
      });
      const user2 = await prisma.user.create({
        data: {
          email: 'test2@example.com',
          passwordHash: 'hashedpass2',
          userName: 'initial_user2',
          isEmailVerified : false,
        },
      });

      user1Id = user1.id;
      user2Id = user2.id;
    });

    afterAll(async () => {
      await prisma.user.deleteMany({
        where: {
          email: { in: ['test1@example.com', 'test2@example.com'] },
        },
      });
    });

    it('should change the username of a user', async () => {
      await userService.changeUsername(user1Id, 'new_username');
      const updatedUser = await prisma.user.findUnique({ where: { id: user1Id } });
      expect(updatedUser).not.toBeNull();
      expect(updatedUser!.userName).toBe('new_username');
    });

    it('should throw if username is already taken', async () => {
      await expect(
        userService.changeUsername(user2Id, 'new_username'),
      ).rejects.toThrow('Username is already taken.');
    });

    it('should throw if username is too long', async () => {
      const longUsername = 'a'.repeat(31);
      await expect(
        userService.changeUsername(user2Id, longUsername),
      ).rejects.toThrow('Username must not exceed 30 characters.');
    });
  });
});
