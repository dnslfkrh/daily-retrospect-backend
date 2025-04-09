import { Injectable } from "@nestjs/common";
import { UserSub } from "src/common/types/user-payload.type";
import { RetrospectSettingDto } from "./dtos/setting.dto";
import { RetrospectAnswerDto } from "./dtos/answer.dto";
import { RetrospectSessionService } from "./services/session.service";
import { RetrospectSettingService } from "./services/setting.service";
import { RetrospectSummaryService } from "./services/summary.service";

@Injectable()
export class RetrospectService {
  constructor(
    private readonly settingService: RetrospectSettingService,
    private readonly sessionService: RetrospectSessionService,
    private readonly summaryService: RetrospectSummaryService
  ) { }

  async getSetting(user: UserSub) {
    return await this.settingService.getSetting(user);
  }

  async setSetting(user: UserSub, setting: RetrospectSettingDto) {
    return await this.settingService.setSetting(user, setting);
  }

  async findOrCreateSession(user: UserSub) {
    return await this.sessionService.findOrCreateSession(user);
  }

  async saveAnswer(user: UserSub, sessionId: number, saveAnswerDto: RetrospectAnswerDto) {
    return await this.sessionService.saveAnswer(user, sessionId, saveAnswerDto);
  }

  async getSessionDates(user: UserSub) {
    return await this.sessionService.getSessionDates(user);
  }

  async getYesterdayAnswers() {
    return await this.sessionService.getYesterdayAnswers();
  }

  async getSummary(user: UserSub, date: string) {
    return await this.summaryService.getSummary(user, date);
  }

  async saveSummary(sessionId: number, userId: number, summary: string) {
    return await this.summaryService.saveSummary(sessionId, userId, summary);
  }

  async getGoalEvaluationAnswers(user: UserSub, period: string) {
    return await this.summaryService.getGoalEvaluationAnswers(user, period);
  }

  async getLastSummary(user: UserSub) {
    return await this.summaryService.getLastSummary(user);
  }
}