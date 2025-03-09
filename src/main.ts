import { NestFactory } from '@nestjs/core';
import { App } from './app';
import { testConnection } from './common/config/database/testConnection';
import { PORT } from './common/config/env/env';

async function bootstrap() {
  const app = await NestFactory.create(App);
  await app.listen(PORT);
}

testConnection();
bootstrap();