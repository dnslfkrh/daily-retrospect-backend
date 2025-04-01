import { Injectable } from '@nestjs/common';
import { UserService } from '../user/user.service';
import { AiService } from '../summary/ai/ai.service';
import { RetrospectService } from '../retrospect/retrospect.service';
import { Cron } from '@nestjs/schedule';
import { UserRetrospectProps } from 'src/common/types/Props';

@Injectable()
export class CronScheduler {
  constructor(
    private readonly userService: UserService,
    private readonly retrospectService: RetrospectService,
    private readonly aiService: AiService
  ) { }

  /* 리마인드 이메일 */
  @Cron('55 12 * * *')
  async sendReminderEmails() {
    await this.userService.sendRemindersToInactiveUsers(2);
  }

  /* 회고 AI 요약 */
  @Cron('13 2 * * *')
  async analyzeRetrospects() {
    const retrospect = await this.retrospectService.getYesterdayAnswers();

    const promises = retrospect.map(async (userRetrospect: UserRetrospectProps) => {
      const sessionId = userRetrospect.sessionId;
      const userId = userRetrospect.userId;
      const retrospectSummary = await this.aiService.summarizeRetrospect(userRetrospect.answers);
      console.log(`AI 요약: ${userId} - ${sessionId} - ${retrospectSummary}`);

      await this.retrospectService.saveSummary(sessionId, userId, retrospectSummary);
    });

    console.log('AI 요약 시작');
    await Promise.all(promises);
    console.log('AI 요약 완료');
  }
}