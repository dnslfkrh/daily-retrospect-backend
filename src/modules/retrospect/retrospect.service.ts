import { ForbiddenException, Injectable, Logger, NotFoundException, UnauthorizedException } from "@nestjs/common";
import * as moment from "moment";
import { UserSub } from "src/common/types/Payload";
import { RetrospectRepository } from "src/modules/retrospect/repository/retrospect.repository";
import { UserRepository } from "src/modules/user/repository/user.repository";
import { RetrospectSettingDto } from "./dto/setting.dto";
import { RetrospectQuestion } from "./entities/question.entity";
import { CONCEPT_RATIOS, RetrospectVolume } from "./enums/retrospect.enum";
import { RetrospectAnswerDto } from "./dto/answer.dto";
import { GoalService } from "../goal/goal.service";
import { isSameDay } from "src/common/utils/isSameDay";
import { RetrospectAnswer } from "./entities/answer.entity";
import { RetrospectSession } from "./entities/session.entity";
import { GoalEvaluationPeriod } from "./enums/goal-evaluation-period.enum";

@Injectable()
export class RetrospectService {
  private readonly logger = new Logger(RetrospectService.name);

  constructor(
    private readonly userRepository: UserRepository,
    private readonly retrospectRepository: RetrospectRepository,
    private readonly goalService: GoalService
  ) { }

  async getSetting(user: UserSub) {
    this.logger.log(`getSetting 호출, user.sub=${user.sub}`);
    const userId = await this.userRepository.findUserIdByCognitoId(user.sub);
    const setting = await this.retrospectRepository.findSetting(userId);
    this.logger.log(`Setting 조회 완료: ${JSON.stringify(setting)}`);
    return setting;
  }

  async setSetting(user: UserSub, setting: RetrospectSettingDto) {
    this.logger.log(`setSetting 호출, user.sub=${user.sub}, setting=${JSON.stringify(setting)}`);
    const userId = await this.userRepository.findUserIdByCognitoId(user.sub);
    const result = await this.retrospectRepository.setSetting(userId, setting);
    this.logger.log(`Setting 저장 완료: ${JSON.stringify(result)}`);
    return result;
  }

  async findOrCreateSession(user: UserSub) {
    this.logger.log(`findOrCreateSession 호출, user.sub=${user.sub}`);
    const userId = await this.userRepository.findUserIdByCognitoId(user.sub);
    const today = moment().format('YYYY-MM-DD');

    let session = await this.retrospectRepository.findSessionByDate(userId, today);
    if (!session) {
      this.logger.log(`세션이 존재하지 않음. 새 세션 생성 시작...`);
      session = await this.createSessionWithQuestions(userId);
      this.logger.log(`새 세션 생성 완료, session.id=${session.id}`);
    } else {
      this.logger.log(`기존 세션 조회 성공, session.id=${session.id}`);
    }

    const [activeGoals, goalQuestion] = await Promise.all([
      this.goalService.getActiveGoals(userId, today),
      this.retrospectRepository.findGoalQuestion()
    ]);

    this.logger.log(`활성 목표 조회 결과: ${JSON.stringify(activeGoals)}`);
    session.goals = activeGoals;

    if (activeGoals.length > 0 && goalQuestion) {
      this.logger.log(`Goal Question 추가: ${goalQuestion.question_text}`);
      session.questions.push(goalQuestion);
    }

    if (!session.answers) {
      session.answers = session.questions.map(question => {
        const answer = new RetrospectAnswer();
        answer.question = question;
        answer.answer = "";
        answer.session = session;
        return answer;
      });
    }

    const transformedSession = {
      id: session.id,
      created_at: session.created_at,
      questions: session.questions,
      goals: session.goals,
      answers: session.answers.map(answer => ({
        question: answer.question,
        answer: answer.answer,
      })),
    };

    this.logger.log(`변환된 세션 데이터: ${JSON.stringify(transformedSession)}`);
    return transformedSession;
  }

  private async createSessionWithQuestions(userId: number) {
    this.logger.log(`createSessionWithQuestions 호출, userId=${userId}`);
    const setting = await this.retrospectRepository.findSetting(userId);
    const concepts = this.getConceptsBySetting(setting);
    this.logger.log(`사용자 설정에 따른 컨셉 조회: ${concepts.join(', ')}`);
    const [mainCount, subCount1, subCount2] = CONCEPT_RATIOS[setting.volume as RetrospectVolume];
    this.logger.log(`컨셉별 질문 수: main=${mainCount}, sub1=${subCount1}, sub2=${subCount2}`);

    const filterPeriodDays = 3;
    this.logger.log(`최근 ${filterPeriodDays}일 내 사용된 질문 제외하는 후보 조회 시작`);

    const [candidateQuestionsMain, candidateQuestionsSub1, candidateQuestionsSub2, commonQuestion] = await Promise.all([
      this.retrospectRepository.findFilteredQuestionsByConcept(concepts[0], filterPeriodDays),
      this.retrospectRepository.findFilteredQuestionsByConcept(concepts[1], filterPeriodDays),
      this.retrospectRepository.findFilteredQuestionsByConcept(concepts[2], filterPeriodDays),
      this.retrospectRepository.findCommonQuestion()
    ]);

    this.logger.log(`후보 질문 조회 완료: main=${candidateQuestionsMain.length}, sub1=${candidateQuestionsSub1.length}, sub2=${candidateQuestionsSub2.length}`);
    this.logger.log(`공통 질문 조회: ${commonQuestion ? commonQuestion.question_text : '없음'}`);

    const selectedMain = this.weightedRandomSelect(candidateQuestionsMain, mainCount);
    const selectedSub1 = this.weightedRandomSelect(candidateQuestionsSub1, subCount1);
    const selectedSub2 = this.weightedRandomSelect(candidateQuestionsSub2, subCount2);
    this.logger.log(`선택된 질문 수: main=${selectedMain.length}, sub1=${selectedSub1.length}, sub2=${selectedSub2.length}`);

    const questions: RetrospectQuestion[] = [
      commonQuestion,
      ...selectedMain,
      ...selectedSub1,
      ...selectedSub2,
    ];
    this.logger.log(`총 선택된 질문 수: ${questions.length}`);

    const newSession = await this.retrospectRepository.createSession(userId);
    this.logger.log(`새 세션 생성: session.id=${newSession.id}`);

    await Promise.all([
      this.retrospectRepository.saveSessionQuestions(newSession.id, questions),
      this.retrospectRepository.updateQuestionsUsage(newSession, questions)
    ]);

    newSession.questions = questions;
    this.logger.log(`세션에 질문 저장 및 사용 이력 업데이트 완료, session.id=${newSession.id}`);

    return newSession;
  }

  // 후보 질문 배열에서 가중치 기반 확률 선택을 수행하는 함수, 각 질문은 사용 이력(없다면 기본 큰 값)을 반영하여 가중치(weight)를 계산하고, total weight 기준 난수로 선택.
  private weightedRandomSelect(candidates: RetrospectQuestion[], count: number): RetrospectQuestion[] {
    this.logger.log(`weightedRandomSelect 호출, 후보 질문 수: ${candidates.length}, 선택할 수: ${count}`);
    const selectedQuestions: RetrospectQuestion[] = [];
    if (!candidates || candidates.length === 0) return selectedQuestions;
    const now = moment();

    const weightedCandidates = candidates.map(q => {
      // 연결된 사용 이력이 있으면 사용 정보를 참조하고, 없으면 기본값 사용
      const usageCount = q.usage?.usage_count || 0;
      const lastUsedAt = q.usage?.last_used_at ? moment(q.usage.last_used_at) : moment().subtract(999, 'days');
      const daysSinceUsed = now.diff(lastUsedAt, 'days');
      const weight = daysSinceUsed / (usageCount + 1);
      this.logger.debug(`질문 id=${q.id}, daysSinceUsed=${daysSinceUsed}, usageCount=${usageCount}, weight=${weight}`);
      return { question: q, weight };
    });

    // Set을 사용하여 선택된 인덱스 추적
    const selectedIndices = new Set<number>();

    for (let i = 0; i < count && selectedIndices.size < weightedCandidates.length; i++) {
      // 아직 선택되지 않은 항목들만 고려
      let totalWeight = 0;
      for (let j = 0; j < weightedCandidates.length; j++) {
        if (!selectedIndices.has(j)) {
          totalWeight += weightedCandidates[j].weight;
        }
      }

      const random = Math.random() * totalWeight;
      let cumulative = 0;
      let selectedIndex = -1;

      for (let j = 0; j < weightedCandidates.length; j++) {
        if (selectedIndices.has(j)) continue;

        cumulative += weightedCandidates[j].weight;
        if (random <= cumulative) {
          selectedIndex = j;
          break;
        }
      }

      // 유효한 선택이 있으면 추가
      if (selectedIndex >= 0) {
        selectedIndices.add(selectedIndex);
        const selectedCandidate = weightedCandidates[selectedIndex];
        this.logger.debug(`선택된 질문 id=${selectedCandidate.question.id} (random=${random}, cumulative=${cumulative})`);
        selectedQuestions.push(selectedCandidate.question);
      }
    }

    this.logger.log(`weightedRandomSelect 완료, 선택된 질문 수: ${selectedQuestions.length}`);
    return selectedQuestions;
  }

  private getConceptsBySetting(setting: RetrospectSettingDto) {
    const conceptWeights = {
      'emotion': ['emotion', 'event', 'reflection'],
      'event': ['event', 'emotion', 'reflection'],
      'reflection': ['reflection', 'event', 'emotion'],
    };
    this.logger.log(`getConceptsBySetting 호출, setting.concept=${setting.concept}`);
    return conceptWeights[setting.concept] || [];
  }

  async saveAnswer(user: UserSub, sessionId: number, saveAnswerDto: RetrospectAnswerDto) {
    this.logger.log(`saveAnswer 호출, sessionId=${sessionId}, user.sub=${user.sub}`);
    const { questionId, answer } = saveAnswerDto;
    const userId = await this.userRepository.findUserIdByCognitoId(user.sub);
    const session = await this.retrospectRepository.findSessionById(sessionId);
    if (!session || session.user.id !== userId) {
      this.logger.error(`세션이 존재하지 않거나 user 불일치: session.user.id=${session?.user?.id}, userId=${userId}`);
      throw new NotFoundException('No session found');
    }
    if (!isSameDay(session.created_at, new Date())) {
      this.logger.error(`세션 생성일과 현재일 불일치: session.created_at=${session.created_at}`);
      throw new ForbiddenException('Retrospect can only be edited on the same day.');
    }
    const result = await this.retrospectRepository.saveAnswer(session.id, questionId, answer);
    this.logger.log(`saveAnswer 완료, answer id=${result.id}`);
    return result;
  }

  async getYesterdayAnswers() {
    this.logger.log(`getYesterdayAnswers 호출`);
    const sessionIds = await this.retrospectRepository.findYesterdayAnswers();
    if (sessionIds.length === 0) {
      this.logger.log(`어제의 세션 없음`);
      return [];
    }
    this.logger.log(`어제의 세션 ID: ${JSON.stringify(sessionIds)}`);
    const detailedSessions = [];
    for (const sessionId of sessionIds) {
      const session = await this.getSessionDetail(sessionId);
      if (!session) continue;
      const sessionData = this.formatSessionData(session);
      if (sessionData.answers.length > 0) {
        detailedSessions.push(sessionData);
      }
    }
    this.logger.log(`getYesterdayAnswers 완료, 세션 수: ${detailedSessions.length}`);
    return detailedSessions;
  }

  async saveSummary(sessionId: number, userId: number, summary: string) {
    this.logger.log(`saveSummary 호출, sessionId=${sessionId}, userId=${userId}`);
    const session = await this.retrospectRepository.findSessionById(sessionId);
    if (!session) {
      this.logger.error(`세션을 찾을 수 없음: sessionId=${sessionId}`);
      throw new NotFoundException('Session not found');
    }
    if (session.user.id !== userId) {
      this.logger.error(`권한 없음, session.user.id=${session.user.id}, userId=${userId}`);
      throw new UnauthorizedException('You do not have permission to add summary to this session');
    }
    const result = await this.retrospectRepository.saveSummary(sessionId, userId, summary);
    this.logger.log(`saveSummary 완료, summary id=${result.id}`);
    return result;
  }

  private async getSessionDetail(sessionId: number) {
    this.logger.log(`getSessionDetail 호출, sessionId=${sessionId}`);
    const session = await this.retrospectRepository.findSessionDetailByIdWithOutUser(sessionId);
    this.logger.log(`getSessionDetail 완료, session.user.id=${session?.user?.id}`);
    return session;
  }

  private formatSessionData(session: RetrospectSession) {
    this.logger.debug(`formatSessionData 호출, session.id=${session.id}`);
    const data = {
      userId: session.user.id,
      sessionId: session.id,
      answers: session.answers
        .filter(answer => answer.question.id !== 36)
        .map(answer => ({
          question: answer.question.question_text,
          answer: answer.answer,
        })),
    };
    this.logger.debug(`formatSessionData 결과: ${JSON.stringify(data)}`);
    return data;
  }

  async getSessionDates(user: UserSub) {
    this.logger.log(`getSessionDates 호출, user.sub=${user.sub}`);
    const userId = await this.userRepository.findUserIdByCognitoId(user.sub);
    const dates = await this.retrospectRepository.findSessionDates(userId);
    this.logger.log(`getSessionDates 결과: ${JSON.stringify(dates)}`);
    return dates;
  }

  async getSummary(user: UserSub, date: string) {
    this.logger.log(`getSummary 호출, user.sub=${user.sub}, date=${date}`);
    const formattedDate = date ? moment(date).format() : moment().format();
    const userId = await this.userRepository.findUserIdByCognitoId(user.sub);
    const summary = await this.retrospectRepository.findSummaryByUserAndDate(userId, formattedDate);
    this.logger.log(`getSummary 결과: ${summary}`);
    return summary;
  }

  async getGoalEvaluationAnswers(user: UserSub, period: string) {
    this.logger.log(`getGoalEvaluationAnswers 호출, user.sub=${user.sub}, period=${period}`);
    const userId = await this.userRepository.findUserIdByCognitoId(user.sub);
    const { startDate, endDate } = this.getPeriodRange(period);
    const answers = await this.retrospectRepository.findGoalEvaluationAnswers(userId, startDate, endDate);
    this.logger.log(`getGoalEvaluationAnswers 결과, answer 수: ${answers.length}`);
    return answers.map(answer => ({
      answer: answer.answer,
      created_at: answer.created_at,
    }));
  }

  private getPeriodRange(period: string) {
    const periodMap: Record<string, GoalEvaluationPeriod> = {
      "1개월": GoalEvaluationPeriod.OneMonth,
      "3개월": GoalEvaluationPeriod.ThreeMonths,
      "6개월": GoalEvaluationPeriod.SixMonths,
      "1년": GoalEvaluationPeriod.OneYear,
    };
    const mappedPeriod = periodMap[period];
    if (!mappedPeriod) {
      this.logger.error(`잘못된 기간 요청: ${period}`);
      throw new Error("Invalid period");
    }
    const endDate = new Date();
    let startDate: Date;
    switch (mappedPeriod) {
      case GoalEvaluationPeriod.OneMonth:
        startDate = moment().subtract(1, "months").toDate();
        break;
      case GoalEvaluationPeriod.ThreeMonths:
        startDate = moment().subtract(3, "months").toDate();
        break;
      case GoalEvaluationPeriod.SixMonths:
        startDate = moment().subtract(6, "months").toDate();
        break;
      case GoalEvaluationPeriod.OneYear:
        startDate = moment().subtract(1, "years").toDate();
        break;
      default:
        this.logger.error(`잘못된 기간 처리: ${period}`);
        throw new Error("Invalid period");
    }
    this.logger.log(`getPeriodRange 결과: startDate=${startDate}, endDate=${endDate}`);
    return { startDate, endDate };
  }

  async getLastSummary(user: UserSub) {
    this.logger.log(`getLastSummary 호출, user.sub=${user.sub}`);
    const userId = await this.userRepository.findUserIdByCognitoId(user.sub);
    const summary = await this.retrospectRepository.findLastSummary(userId);
    this.logger.log(`getLastSummary 결과: ${JSON.stringify(summary)}`);
    return summary;
  }
}
