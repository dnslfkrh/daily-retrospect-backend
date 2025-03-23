import { Module } from '@nestjs/common';
import { UserModule } from '../user/user.module';
import { CronScheduler } from './cron.scheduler';

@Module({
  imports: [
    UserModule
  ],
  providers: [
    CronScheduler
  ]
})

export class CronModule { }