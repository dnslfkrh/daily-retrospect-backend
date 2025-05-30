import { Injectable } from '@nestjs/common';
import { UserService } from '../user/user.service';
import { AiService } from '../ai/ai.service';
import { RetrospectService } from '../retrospect/retrospect.service';
import { FormattedYesterdaySession } from '../retrospect/types/retrospect-output.types';
import { Cron } from '@nestjs/schedule';

@Injectable()
export class CronScheduler {
  constructor(
    private readonly userService: UserService,
    private readonly retrospectService: RetrospectService,
    private readonly aiService: AiService
  ) { }

  /* 리마인드 이메일 */
  // @Cron('55 12 * * *')
  async sendReminderEmails() {
    await this.userService.sendRemindersToInactiveUsers(2);
  }

  /* 회고 AI 요약 */
  // @Cron('00 17 * * *')
  async analyzeRetrospects1() {
    console.log('AI 요약 시작');

    const retrospect = await this.retrospectService.getYesterdayAnswers();

    const promises = retrospect.map(async (userRetrospect: FormattedYesterdaySession) => {
      const sessionId = userRetrospect.sessionId;
      const userId = userRetrospect.userId;

      const transformedAnswers = userRetrospect.answers.map(answer => ({
        question: typeof answer.question === 'string'
          ? answer.question
          : JSON.stringify(answer.question),
        answer: String(answer.answer),
      }));

      const retrospectSummary = await this.aiService.summarizeRetrospect(transformedAnswers);

      console.log(`${userId}번 사용자 AI 요약 완료: ${retrospectSummary}`);

      await this.retrospectService.saveSummary(sessionId, userId, retrospectSummary);

      console.log(`사용자 ${userId}, 세션 ${sessionId}에 대한 요약 저장 완료`);
    });

    await Promise.all(promises);

    console.log('모든 AI 요약 완료');
  }

  // 나중에 성능 비교
  // async analyzeRetrospects2() {
  //   console.log('AI 요약 시작');
  //
  //   const retrospect = await this.retrospectService.getYesterdayAnswers();
  //
  //   for (const userRetrospect of retrospect) {
  //     const sessionId = userRetrospect.sessionId;
  //     const userId = userRetrospect.userId;
  //     const retrospectSummary = await this.aiService.summarizeRetrospect(userRetrospect.answers);
  //
  //     console.log(`AI 요약 완료: ${userId} - ${sessionId} - ${retrospectSummary}`);
  //
  //     await this.retrospectService.saveSummary(sessionId, userId, retrospectSummary);
  //   }
  //
  //   console.log('모든 AI 요약 완료');
  // }
}
