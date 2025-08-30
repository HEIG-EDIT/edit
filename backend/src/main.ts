import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as cookieParser from 'cookie-parser';
import * as bodyParser from 'body-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  //CORS
  app.enableCors({
    origin: ['http://localhost:3000'],
    credentials: true,
  });
  app.use(cookieParser());

  // Increase body size limit
  app.use(bodyParser.json({ limit: '5mb' }));  // adjust as needed
  app.use(bodyParser.urlencoded({ limit: '5mb', extended: true }));
  
  await app.listen(process.env.PORT ?? 4000);
}
bootstrap();
