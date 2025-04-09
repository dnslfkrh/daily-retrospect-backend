import { Injectable, NotFoundException, UnauthorizedException } from "@nestjs/common";
import { UserSub } from "src/common/types/user-payload.type";
import { UserRepository } from "src/modules/user/repository/user.repository";
import * as moment from "moment";
import { GoalEvaluationPeriodEnum } from "../enums/goal-evaluation-period.enum";
import { RetrospectAnswerRepository } from "../repositories/answer.repository";
import { RetrospectSessionRepository } from "../repositories/session.repository";
import { RetrospectSummaryRepository } from "../repositories/summary.repository";

@Injectable()
export class RetrospectSummaryService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly sessionRepository: RetrospectSessionRepository,
    private readonly summaryRepository: RetrospectSummaryRepository,
    private readonly answerRepository: RetrospectAnswerRepository
  ) {}

  async saveSummary(sessionId: number, userId: number, summary: string) {
    const session = await this.sessionRepository.findSessionById(sessionId);
    if (!session) {
      throw new NotFoundException('Session not found');
    }
    if (session.user.id !== userId) {
      throw new UnauthorizedException('You do not have permission to add summary to this session');
    }
    return await this.summaryRepository.saveSummary(sessionId, userId, summary);
  }

  async getSummary(user: UserSub, date: string) {
    const formattedDate = date ? moment(date).format() : moment().format();
    const userId = await this.userRepository.findUserIdByCognitoId(user.sub);
    return await this.summaryRepository.findSummaryByUserAndDate(userId, formattedDate);
  }

  async getLastSummary(user: UserSub) {
    const userId = await this.userRepository.findUserIdByCognitoId(user.sub);
    return await this.summaryRepository.findLastSummary(userId);
  }

  async getGoalEvaluationAnswers(user: UserSub, period: string) {
    const userId = await this.userRepository.findUserIdByCognitoId(user.sub);
    const { startDate, endDate } = this.getPeriodRange(period);
    const answers = await this.answerRepository.findGoalEvaluationAnswers(userId, startDate, endDate);
    return answers.map(answer => ({
      answer: answer.answer,
      created_at: answer.created_at,
    }));
  }

  private getPeriodRange(period: string) {
    const periodMap: Record<string, GoalEvaluationPeriodEnum> = {
      "1개월": GoalEvaluationPeriodEnum.OneMonth,
      "3개월": GoalEvaluationPeriodEnum.ThreeMonths,
      "6개월": GoalEvaluationPeriodEnum.SixMonths,
      "1년": GoalEvaluationPeriodEnum.OneYear,
    };
    const mappedPeriod = periodMap[period];
    if (!mappedPeriod) {
      throw new Error("Invalid period");
    }
    const endDate = new Date();
    let startDate: Date;
    switch (mappedPeriod) {
      case GoalEvaluationPeriodEnum.OneMonth:
        startDate = moment().subtract(1, "months").toDate();
        break;
      case GoalEvaluationPeriodEnum.ThreeMonths:
        startDate = moment().subtract(3, "months").toDate();
        break;
      case GoalEvaluationPeriodEnum.SixMonths:
        startDate = moment().subtract(6, "months").toDate();
        break;
      case GoalEvaluationPeriodEnum.OneYear:
        startDate = moment().subtract(1, "years").toDate();
        break;
      default:
        throw new Error("Invalid period");
    }
    return { startDate, endDate };
  }
}