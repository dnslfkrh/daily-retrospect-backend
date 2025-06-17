import { NestFactory } from '@nestjs/core';
import { App } from './app';
import { ValidationPipe } from '@nestjs/common';
import * as cookieParser from 'cookie-parser';
import { ConfigService } from "@nestjs/config";
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(App);
  const configService = app.get(ConfigService);

  const config = new DocumentBuilder()
    .setTitle('Daily Retrospect API')
    .setDescription('일일회고 API 명세서')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  app.enableCors({
    origin: configService.get<string>('FRONTEND_URL'),
    credentials: true,
  });

  app.use(cookieParser());

  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    transform: true,
    forbidNonWhitelisted: true,
  }));

  const PORT = configService.get<number>('PORT');
  const BACKEND_URL = configService.get<string>('BACKEND_URL');

  await app.listen(PORT, "0.0.0.0");

  console.log(`Swagger documentation available at ${BACKEND_URL}/api`);
}

bootstrap();