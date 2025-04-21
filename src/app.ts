import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { getMysqlConfig } from './common/config/database/mysql';
import { AuthModule } from './modules/auth/auth.module';
import { UserModule } from './modules/user/user.module';
import { APP_GUARD, Reflector } from '@nestjs/core';
import { JwtAuthGuard } from './modules/auth/guard/token.guard';
import { RetrospectModule } from './modules/retrospect/retrospect.module';
import { GoalModule } from './modules/goal/goal.module';
import { ReminderModule } from './modules/reminder/reminder.module';
import { CronModule } from './modules/cron/cron.module';
import { AiModule } from './modules/ai/ai.module';
import { ScheduleModule } from '@nestjs/schedule';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ImageModule } from './modules/image/image.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: process.env.NODE_ENV === 'development' ? '.env.dev' : '.env.prod',
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => await getMysqlConfig(configService)
    }),
    ScheduleModule.forRoot(),
    CronModule,
    AuthModule,
    UserModule,
    RetrospectModule,
    GoalModule,
    ReminderModule,
    AiModule,
    ImageModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    Reflector
  ],
})

export class App { }