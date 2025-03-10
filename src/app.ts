import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { mysqlConfig } from './common/config/database/mysql';
import { AuthModule } from './modules/auth/auth.module';
import { APP_GUARD } from '@nestjs/core';
import { AccessTokenGuard } from './modules/auth/guards/access.guard';
import { UserModule } from './modules/user/user.module';
import { GoogleModule } from './modules/google/google.module';

@Module({
  imports: [
    TypeOrmModule.forRoot(mysqlConfig),
    AuthModule,
    UserModule,
    GoogleModule
  ],
  controllers: [],
  providers: [
    {
      provide: APP_GUARD,
      useClass: AccessTokenGuard
    }
  ],
})
export class App { }
