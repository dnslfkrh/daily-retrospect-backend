import { Injectable } from "@nestjs/common";
import { UserSub } from "src/common/types/user-payload.type";
import { RetrospectSettingDto } from "./dtos/setting.dto";
import { RetrospectAnswerDto } from "./dtos/answer.dto";
import { RetrospectSessionService } from "./services/session.service";
import { RetrospectSettingService } from "./services/setting.service";
import { RetrospectSummaryService } from "./services/summary.service";
import { RetrospectSetting } from "./entities/setting.entity";
import { RetrospectAnswer } from "./entities/answer.entity";
import { RetrospectSummary } from "./entities/summary.entity";
import { FormattedSessionOutput, FormattedYesterdaySession } from "./types/retrospect-output.types";
import { GoalEvaluationAnswerOutput } from "./types/goal-evaluation-answer.type";

@Injectable()
export class RetrospectService {
  constructor(
    private readonly settingService: RetrospectSettingService,
    private readonly sessionService: RetrospectSessionService,
    private readonly summaryService: RetrospectSummaryService
  ) { }

  async getSetting(user: UserSub): Promise<RetrospectSettingDto> {
    return await this.settingService.getSetting(user);
  }

  async setSetting(user: UserSub, setting: RetrospectSettingDto): Promise<RetrospectSetting> {
    return await this.settingService.setSetting(user, setting);
  }

  async findOrCreateSession(user: UserSub): Promise<FormattedSessionOutput> {
    return await this.sessionService.findOrCreateSession(user);
  }

  async saveAnswer(user: UserSub, sessionId: number, saveAnswerDto: RetrospectAnswerDto): Promise<RetrospectAnswer> {
    return await this.sessionService.saveAnswer(user, sessionId, saveAnswerDto);
  }

  async getSessionDates(user: UserSub): Promise<Date[]> {
    return await this.sessionService.getSessionDates(user);
  }

  async getYesterdayAnswers(): Promise<FormattedYesterdaySession[]> {
    return await this.sessionService.getYesterdayAnswers();
  }

  async getSummary(user: UserSub, date: string): Promise<string | null> {
    return await this.summaryService.getSummary(user, date);
  }

  async saveSummary(sessionId: number, userId: number, summary: string): Promise<RetrospectSummary> {
    return await this.summaryService.saveSummary(sessionId, userId, summary);
  }

  async getGoalEvaluationAnswers(user: UserSub, period: string): Promise<GoalEvaluationAnswerOutput[]> {
    return await this.summaryService.getGoalEvaluationAnswers(user, period);
  }

  async getLastSummary(user: UserSub): Promise<RetrospectSummary | null> {
    return await this.summaryService.getLastSummary(user);
  }
}