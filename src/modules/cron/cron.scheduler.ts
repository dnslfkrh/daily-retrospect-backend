import { Injectable } from '@nestjs/common';
import { UserService } from '../user/user.service';
import { AiService } from '../summary/ai/ai.service';
import { RetrospectService } from '../retrospect/retrospect.service';
import { Cron } from '@nestjs/schedule';

@Injectable()
export class CronScheduler {
  constructor(
    private readonly userService: UserService,
    private readonly retrospectService: RetrospectService,
    private readonly aiService: AiService
  ) { }

  @Cron('0 19 * * *')
  async sendReminderEmails() {
    await this.userService.sendRemindersToInactiveUsers(2);
  }

  @Cron('54 3 * * *')
  async analyzeRetrospects() {
    const retrospect = await this.retrospectService.getYesterdayAnswers();
    console.log("정리된 데이터", JSON.stringify(retrospect, null, 2), "데이터 끝");
  }
}