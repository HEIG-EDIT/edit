import { AuthService } from '../auth.service';
import { TokensService } from '../tokens/tokens.service';
import { UsersService } from '../../users/users.service';
import { PrismaService } from '../../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { RegisterDto } from '../dto/register.dto';
import { LoginDto } from '../dto/login.dto';
import * as bcrypt from 'bcrypt';

describe('AuthService (integration)', () => {
  let service: AuthService;
  let prisma: PrismaService;
  let usersService: UsersService;
  let tokensService: TokensService;
  let jwtService: JwtService;

  beforeAll(async () => {
    prisma = new PrismaService();
    usersService = new UsersService(prisma);
    tokensService = new TokensService();
    jwtService = new JwtService({ secret: 'test-secret' } as any);
    const configService = new ConfigService();

    service = new AuthService(
      usersService,
      jwtService,
      prisma,
      tokensService
    );
  });

  afterAll(async () => {
    await prisma.refreshToken.deleteMany();
    await prisma.user.deleteMany();
    await prisma.$disconnect();
  });

  describe('registerUser', () => {
    it('should register a new user', async () => {
      const dto: RegisterDto = {
        email: 'test-register@example.com',
        password: 'StrongP@ssword1',
      };
      const result = await service.registerUser(dto);
      expect(result.message).toBe('Account created successfully, please proceed to login');

      const user = await prisma.user.findUnique({ where: { email: dto.email } });
      expect(user).toBeDefined();
      expect(await bcrypt.compare(dto.password, user!.passwordHash!)).toBe(true);
    });

    it('should return conflict for duplicate email', async () => {
      const dto: RegisterDto = {
        email: 'test-register@example.com',
        password: 'StrongP@ssword1',
      };
      const result = await service.registerUser(dto);
      expect(result.message).toBe('An account with this email already exists');
    });
  });

  describe('loginLocal', () => {
    it('should throw UnauthorizedException for wrong password', async () => {
      const dto: LoginDto = {
        email: 'test-register@example.com',
        password: 'WrongPassword1!',
      };
      await expect(service.loginLocal(dto)).rejects.toThrow('Invalid credentials');
    });

    it('should login successfully and return tokens', async () => {
      const dto: LoginDto = {
        email: 'test-register@example.com',
        password: 'StrongP@ssword1',
      };
      const result = await service.loginLocal(dto);
      expect(result.accessToken).toBeDefined();
      expect(result.refreshToken).toBeDefined();
      expect(result.user.email).toBe(dto.email);
    });
  });

  describe('logoutUser', () => {
    it('should logout user and revoke tokens', async () => {
      const dto: LoginDto = {
        email: 'test-register@example.com',
        password: 'StrongP@ssword1',
      };
      const loginRes = await service.loginLocal(dto);
      const deviceId = loginRes.deviceId;

      const logoutRes = await service.logoutUser(loginRes.user.id, deviceId);
      expect(logoutRes.message).toBe('Logged out successfully');
    });
  });
});
