import * as dotenv from "dotenv";
dotenv.config();

import { NestFactory } from '@nestjs/core';
import { App } from './app';
import { testConnection } from './common/utils/testConnection';
import { Logger, ValidationPipe } from '@nestjs/common';
import * as cookieParser from 'cookie-parser';
import { ConfigService } from "@nestjs/config";

const logger = new Logger("TestConnection");

async function bootstrap() {

  const app = await NestFactory.create(App);
  const configService = app.get(ConfigService);

  app.enableCors({
    origin: configService.get<string>('FRONTEND_URL'),
    credentials: true,
  });

  app.use(cookieParser());

  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,            // DTO에 정의되지 않은 값 자동 제거
    transform: true,            // 요청 데이터를 DTO 타입으로 변환
    forbidNonWhitelisted: true, // DTO에 없는 값이 들어오면 에러 발생
  }));

  const PORT = configService.get<number>('PORT');
  const BACKEND_URL = configService.get<string>('BACKEND_URL');

  await app.listen(PORT, "0.0.0.0");

  logger.log(`Server is running on ${BACKEND_URL}, Port: ${PORT}`);
}

testConnection();
bootstrap();
