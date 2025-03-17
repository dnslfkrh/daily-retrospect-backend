import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { mysqlConfig } from './common/config/database/mysql';
import { AuthModule } from './modules/auth/auth.module';
import { UserModule } from './modules/user/user.module';
import { APP_GUARD, Reflector } from '@nestjs/core';
import { JwtAuthGuard } from './modules/auth/guard/token.guard';
import { RetrospectModule } from './modules/retrospect/retrospect.module';
import { GoalModule } from './modules/goal/goal.module';

@Module({
  imports: [
    TypeOrmModule.forRoot(mysqlConfig),
    AuthModule,
    UserModule,
    RetrospectModule,
    GoalModule
  ],
  controllers: [],
  providers: [
    {
      provide: APP_GUARD, // 전역 가드, 사용자 바로 @User()
      useClass: JwtAuthGuard,
    },
    Reflector
  ],
})

export class App { }