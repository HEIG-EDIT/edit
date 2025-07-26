// scripts/test-user-service.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { UserService } from '../src/user/user.service';
import { CreateUserDto } from '../src/user/dto/create-user.dto';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule); // ← no HTTP server

  const userService = app.get(UserService);

  const testUser: CreateUserDto = {
    email: `test-${Date.now()}@example.com`,
    password: 'supersecure123',
  };

  try {
    const user = await userService.createUser(testUser);
    console.log('✅ Created user:', user); // ✅ You should see this
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await app.close();
  }
}

bootstrap();
