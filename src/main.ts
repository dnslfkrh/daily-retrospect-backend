import * as dotenv from "dotenv";
dotenv.config();

import { NestFactory } from '@nestjs/core';
import { App } from './app';
import { testConnection } from './common/config/database/testConnection';
import { ValidationPipe } from '@nestjs/common';
import * as cookieParser from 'cookie-parser';

async function bootstrap() {

  const app = await NestFactory.create(App);

  app.enableCors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
  });

  app.use(cookieParser());

  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,            // DTO에 정의되지 않은 값 자동 제거
    transform: true,            // 요청 데이터를 DTO 타입으로 변환
    forbidNonWhitelisted: true, // DTO에 없는 값이 들어오면 에러 발생
  }));
  await app.listen(Number(process.env.PORT), "0.0.0.0");
}

testConnection();
bootstrap();
