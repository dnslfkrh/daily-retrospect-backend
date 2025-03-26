import { Injectable, OnModuleInit } from '@nestjs/common';
import * as Cron from 'node-cron';
import { UserService } from '../user/user.service';
import { AiService } from '../summary/ai/ai.service';
import { RetrospectService } from '../retrospect/retrospect.service';

@Injectable()
export class CronScheduler implements OnModuleInit {
  constructor(
    private readonly userService: UserService,
    private readonly retrospectService: RetrospectService,
    private readonly aiService: AiService
  ) { }

  // 도메인 연결 이후 크론잡 람다로 변경
  onModuleInit() {
    /* 2일 이상 회고를 작성하지 않은 사용자에게 리마인드 이메일 전송 */
    Cron.schedule('* 19 * * *', async () => {
      await this.userService.sendRemindersToInactiveUsers(2);
    });

    /* 전날 회고 AI 분석 */
    Cron.schedule('54 3 * * *', async () => {
      const retrospect = await this.retrospectService.getYesterdayAnswers();
      console.log("정리된 데이터", JSON.stringify(retrospect, null, 2), "데이터 끝");
    })
  }
}