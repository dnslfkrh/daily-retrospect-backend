import { Module } from '@nestjs/common';
import { UserModule } from '../user/user.module';
import { CronScheduler } from './cron.scheduler';
import { RetrospectModule } from '../retrospect/retrospect.module';
import { SummaryModule } from '../summary/summary.module';

@Module({
  imports: [
    UserModule,
    RetrospectModule,
    SummaryModule
  ],
  providers: [
    CronScheduler
  ]
})

export class CronModule { }