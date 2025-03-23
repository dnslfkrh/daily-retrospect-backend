import { Injectable, OnModuleInit } from '@nestjs/common';
import * as Cron from 'node-cron';
import { UserService } from '../user/user.service';

@Injectable()
export class CronScheduler implements OnModuleInit {
  constructor(private readonly userService: UserService) { }

  onModuleInit() {
    Cron.schedule('* 19 * * *', async () => {
      await this.userService.sendRemindersToInactiveUsers(2);
    });
  }
}
