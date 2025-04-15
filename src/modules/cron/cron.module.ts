import { Module } from '@nestjs/common';
import { UserModule } from '../user/user.module';
import { CronScheduler } from './cron.scheduler';
import { RetrospectModule } from '../retrospect/retrospect.module';
import { AiModule } from '../ai/ai.module';

@Module({
  imports: [
    UserModule,
    RetrospectModule,
    AiModule,
  ],
  providers: [
    CronScheduler
  ]
})

export class CronModule { }