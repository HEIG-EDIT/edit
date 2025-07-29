import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { UsersService } from '../users.service';
import { CreateUserDto } from '../dto/create-user.dto';
import { execSync } from 'child_process';
import { PrismaClient } from '@prisma/client';
import path from 'path';

describe('UserService Integration', () => {
  let app: INestApplication;
  let userService: UsersService;
  let prisma: PrismaClient;
  const testEmails = ['unique@example.com', 'duplicate@example.com'];

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
    await prisma.user.deleteMany({
      where: {
        email: {
          in: testEmails,
        },
      },
    });

    await app.close();

    console.log('🔴 Stopping docker containers...');
    execSync('docker compose down', { stdio: 'inherit' });
  });

  // Test duplicate email behavior
  it('should throw ConflictException if email already exists', async () => {
    const dto: CreateUserDto = {
      email: 'duplicate@example.com',
      password: 'password123',
    };

    // Create user first
    await userService.createUser(dto);

    // Try to create user again with same email
    await expect(userService.createUser(dto)).rejects.toThrow('Email already exists');
  });

  // Test user creation with a unique email
  it('should create a user with unique email and random username', async () => {
    const dto: CreateUserDto = {
      email: 'unique@example.com',
      password: 'password123',
    };

    const user = await userService.createUser(dto);

    expect(user.email).toBe(dto.email);
    expect(user.userName).toMatch(/^user_/);
    expect(user.id).toBeDefined();
    expect(user.createdAt).toBeDefined();
  });
});
