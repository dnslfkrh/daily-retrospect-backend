import { Injectable, NotFoundException, UnauthorizedException } from "@nestjs/common";
import { UserSub } from "src/common/types/user-payload.type";
import { UserRepository } from "src/modules/user/repository/user.repository";
import * as moment from "moment";
import { GoalEvaluationPeriodEnum } from "../enums/goal-evaluation-period.enum";
import { RetrospectAnswerRepository } from "../repositories/answer.repository";
import { RetrospectSessionRepository } from "../repositories/session.repository";
import { RetrospectSummaryRepository } from "../repositories/summary.repository";
import { RetrospectSummary } from "../entities/summary.entity";
import { RetrospectAnswer } from "../entities/answer.entity";
import { GoalEvaluationAnswerOutput } from "../types/goal-evaluation-answer.type";

@Injectable()
export class RetrospectSummaryService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly sessionRepository: RetrospectSessionRepository,
    private readonly summaryRepository: RetrospectSummaryRepository,
    private readonly answerRepository: RetrospectAnswerRepository
  ) { }

  /**
  * 특정 세션에 대한 회고 요약 저장
  * @param sessionId 세션 ID
  * @param userId 사용자 ID (세션 소유자 ID)
  * @param summary 요약 내용
  * @returns 저장된 요약 엔티티 (RetrospectSummary)
  * @throws NotFoundException 세션을 찾을 수 없는 경우
  * @throws UnauthorizedException 세션 소유자가 아닌 경우
  */
  async saveSummary(sessionId: number, userId: number, summary: string): Promise<RetrospectSummary> {
    const session = await this.sessionRepository.findSessionById(sessionId);
    if (!session) {
      throw new NotFoundException(`Session with ID ${sessionId} not found.`);
    }
    if (session.user.id !== userId) {
      throw new UnauthorizedException('User ID does not match the session owner.');
    }

    return await this.summaryRepository.saveSummary(sessionId, userId, summary);
  }

  /**
  * 특정 날짜의 사용자 회고 요약 조회
  * @param user 사용자 정보
  * @param date 조회할 날짜 (YYYY-MM-DD 형식 문자열)
  * @returns 요약 내용 문자열 또는 null
  */
  async getSummary(user: UserSub, date: string): Promise<string | null> {
    const formattedDate = date ? moment(date).format('YYYY-MM-DD') : moment().format('YYYY-MM-DD');
    const userId = await this.userRepository.findUserIdByCognitoId(user.sub);
    return await this.summaryRepository.findSummaryByUserAndDate(userId, formattedDate);
  }

  /**
  * 사용자의 가장 최근 회고 요약 조회
  * @param user 사용자 정보
  * @returns 가장 최근 요약 엔티티 (RetrospectSummary) 또는 null
  */
  async getLastSummary(user: UserSub): Promise<RetrospectSummary | null> {
    const userId = await this.userRepository.findUserIdByCognitoId(user.sub);
    return await this.summaryRepository.findLastSummary(userId);
  }

  /**
  * 지정된 기간 동안의 사용자의 목표 평가 질문 답변 목록 조회
  * @param user 사용자 정보
  * @param period 기간 문자열 ("1개월", "3개월", "6개월", "1년")
  * @returns 목표 평가 답변 및 생성일 배열 (GoalEvaluationAnswerOutput[])
  */
  async getGoalEvaluationAnswers(user: UserSub, period: string): Promise<GoalEvaluationAnswerOutput[]> {
    const userId = await this.userRepository.findUserIdByCognitoId(user.sub);
    const { startDate, endDate } = this.getPeriodRange(period);

    const answers: RetrospectAnswer[] = await this.answerRepository.findGoalEvaluationAnswers(userId, startDate, endDate);

    return answers.map(answer => ({
      answer: Array.isArray(answer.answer)
        ? answer.answer.join(', ')
        : answer.answer,
      created_at: answer.created_at,
    }));
  }

  /**
  * 기간 문자열에 해당하는 시작일과 종료일 계산
  * @param period 기간 문자열
  * @returns 시작일(startDate)과 종료일(endDate) 객체
  * @throws Error 유효하지 않은 기간 문자열인 경우
  */
  private getPeriodRange(period: string): { startDate: Date, endDate: Date } {
    const periodMap: Record<string, GoalEvaluationPeriodEnum> = {
      "1개월": GoalEvaluationPeriodEnum.OneMonth,
      "3개월": GoalEvaluationPeriodEnum.ThreeMonths,
      "6개월": GoalEvaluationPeriodEnum.SixMonths,
      "1년": GoalEvaluationPeriodEnum.OneYear,
    };
    const mappedPeriod = periodMap[period];

    if (!mappedPeriod) {
      throw new Error(`Invalid period string provided: ${period}`);
    }

    const endDate = new Date();
    let startDate: Date;

    switch (mappedPeriod) {
      case GoalEvaluationPeriodEnum.OneMonth:
        startDate = moment().subtract(1, "months").startOf('day').toDate();
        break;
      case GoalEvaluationPeriodEnum.ThreeMonths:
        startDate = moment().subtract(3, "months").startOf('day').toDate();
        break;
      case GoalEvaluationPeriodEnum.SixMonths:
        startDate = moment().subtract(6, "months").startOf('day').toDate();
        break;
      case GoalEvaluationPeriodEnum.OneYear:
        startDate = moment().subtract(1, "years").startOf('day').toDate();
        break;
      default:
        throw new Error("Invalid period enum value.");
    }
    return { startDate, endDate };
  }
}