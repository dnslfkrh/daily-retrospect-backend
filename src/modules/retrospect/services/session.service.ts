import { ForbiddenException, Injectable, NotFoundException, UnauthorizedException } from "@nestjs/common";
import { UserSub } from "src/common/types/user-payload.type";
import { UserRepository } from "src/modules/user/repository/user.repository";
import * as moment from "moment";
import { isSameDay } from "date-fns";
import { GoalService } from "src/modules/goal/goal.service";
import { RetrospectAnswerDto } from "../dtos/answer.dto";
import { RetrospectAnswer } from "../entities/answer.entity";
import { RetrospectAnswerRepository } from "../repositories/answer.repository";
import { RetrospectSessionRepository } from "../repositories/session.repository";
import { RetrospectSettingRepository } from "../repositories/setting.repository";
import { RetrospectQuestionService } from "./question.service";
import { RetrospectSettingDto } from "../dtos/setting.dto";
import { RetrospectQuestion } from "../entities/question.entity";
import { RetrospectSession } from "../entities/session.entity";
import { FormattedSessionOutput, FormattedYesterdaySession } from "../types/retrospect-output.types";

@Injectable()
export class RetrospectSessionService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly sessionRepository: RetrospectSessionRepository,
    private readonly answerRepository: RetrospectAnswerRepository,
    private readonly settingRepository: RetrospectSettingRepository,
    private readonly questionService: RetrospectQuestionService,
    private readonly goalService: GoalService
  ) { }

  /**
  * 오늘 날짜의 회고 세션을 찾거나 생성 후 반환
  * 활성 목표 및 목표 질문을 세션에 추가합니다.
  * @param user 사용자 정보 (sub)
  * @returns 포맷팅된 세션 정보 (FormattedSessionOutput)
  */
  async findOrCreateSession(user: UserSub): Promise<FormattedSessionOutput> {
    const userId = await this.userRepository.findUserIdByCognitoId(user.sub);
    const today = moment().tz("Asia/Seoul").format("YYYY-MM-DD");

    let session = await this.sessionRepository.findSessionByDate(userId, today);

    if (!session) {
      session = await this.createSessionWithQuestions(userId);

      const reloadedSession = await this.sessionRepository.findSessionByDate(userId, today);
      if (!reloadedSession) throw new NotFoundException("Failed to reload session details.");
      session = reloadedSession;
    } else {
      if (!session.questions || !session.answers || !session.goals) {
        const reloadedSession = await this.sessionRepository.findSessionByDate(userId, today);
        if (!reloadedSession) throw new NotFoundException(`Session ${session.id} details could not be reloaded.`);
        session = reloadedSession;
      }
    }

    const [activeGoals, goalQuestion] = await Promise.all([
      this.goalService.getActiveGoals(userId, today),
      this.questionService.findGoalQuestion()
    ]);

    session.goals = activeGoals;

    const goalQuestionExists = session.questions.some(q => q.id === goalQuestion?.id);
    if (activeGoals.length > 0 && goalQuestion && !goalQuestionExists) {
      session.questions.push(goalQuestion);
    }

    const existingAnswerQuestionIds = new Set(
      session.answers
        .filter(a => a.question && a.question.id)
        .map(a => a.question.id)
    );

    for (const question of session.questions) {
      if (!existingAnswerQuestionIds.has(question.id)) {
        const newAnswer = new RetrospectAnswer();
        newAnswer.question = question;
        newAnswer.answer = "";
        newAnswer.session = session;
        session.answers.push(newAnswer);
      }
    }

    const transformedSession: FormattedSessionOutput = {
      id: session.id,
      created_at: session.created_at,
      questions: session.questions,
      goals: session.goals || [],
      answers: session.answers.map(answer => ({
        question: answer.question,
        answer: Array.isArray(answer.answer)
          ? answer.answer.join(', ')
          : answer.answer ?? ""
      })),
    };

    return transformedSession;
  }

  /**
  * 새로운 회고 세션을 생성하고 관련 질문 설정
  * @param userId 사용자 ID
  * @returns 생성된 RetrospectSession (질문 포함)
  */
  private async createSessionWithQuestions(userId: number): Promise<RetrospectSession> {
    const setting: RetrospectSettingDto = await this.settingRepository.findSetting(userId);
    const questionsRaw = await this.questionService.selectQuestionsForSession(setting, userId);
    const questions = questionsRaw.filter((q): q is RetrospectQuestion => q !== undefined);

    const newSession = await this.sessionRepository.createSession(userId);

    await Promise.all([
      this.sessionRepository.saveSessionQuestions(newSession, questions),
      this.questionService.updateQuestionsUsage(newSession, questions, userId)
    ]);

    newSession.questions = questions;
    return newSession;
  }

  /**
  * 특정 세션의 특정 질문에 대한 답변 저장/업데이트
  * @param user 사용자 정보
  * @param sessionId 세션 ID
  * @param saveAnswerDto 답변 정보 DTO
  * @returns 저장된 RetrospectAnswer
  * @throws NotFoundException 세션을 찾을 수 없거나 사용자 권한이 없는 경우
  * @throws ForbiddenException 당일 작성된 회고만 수정 가능한 경우
  */
  async saveAnswer(user: UserSub, sessionId: number, saveAnswerDto: RetrospectAnswerDto): Promise<RetrospectAnswer> {
    const { questionId, answer } = saveAnswerDto;
    const userId = await this.userRepository.findUserIdByCognitoId(user.sub);

    const session = await this.sessionRepository.findSessionById(sessionId);

    if (!session) {
      throw new NotFoundException(`Session with ID ${sessionId} not found.`);
    }
    if (session.user.id !== userId) {
      throw new UnauthorizedException('You do not have permission to edit answers in this session.');
    }

    if (!isSameDay(session.created_at, new Date())) {
      throw new ForbiddenException('Retrospect can only be edited on the day it was created.');
    }

    return await this.answerRepository.saveAnswer(session.id, questionId, answer as string);
  }

  /**
  * 사용자가 작성한 모든 회고 세션의 날짜 목록 조회
  * @param user 사용자 정보
  * @returns 회고 작성 날짜(Date 객체) 배열 (내림차순)
  */
  async getSessionDates(user: UserSub): Promise<Date[]> {
    const userId = await this.userRepository.findUserIdByCognitoId(user.sub);
    return await this.sessionRepository.findSessionDates(userId);
  }

  /**
  * 어제 작성된 모든 세션의 상세 정보 조회
  * @returns 어제 작성된 세션들의 포맷팅된 정보 배열 (FormattedYesterdaySession[])
  */
  async getYesterdayAnswers(): Promise<FormattedYesterdaySession[]> {
    const yesterdaySessionIds = await this.sessionRepository.findYesterdaySessionIds();

    if (yesterdaySessionIds.length === 0) {
      return [];
    }

    const detailedSessions = await this.sessionRepository.findSessionsByIdsWithRelations(yesterdaySessionIds);

    const formattedData = detailedSessions
      .map(session => this.formatSessionData(session))
      .filter(sessionData => sessionData.answers.length > 0);

    return formattedData;
  }

  /**
  * 세션 데이터를 지정된 포맷으로 변환
  * @param session 상세 정보가 로드된 RetrospectSession
  * @returns 포맷팅된 세션 데이터 (FormattedYesterdaySession)
  */
  private formatSessionData(session: RetrospectSession): FormattedYesterdaySession {
    if (!session.user || !session.answers || !session.answers.every(a => a.question)) {
      console.error(`Missing relations for session ID ${session.id} in formatSessionData.`);
      return { userId: session.user?.id ?? -1, sessionId: session.id, answers: [] };
    }

    return {
      userId: session.user.id,
      sessionId: session.id,
      answers: session.answers.map(answer => ({
        question: answer.question,
        answer: Array.isArray(answer.answer)
          ? answer.answer.join(', ')
          : answer.answer ?? ""
      })),
    };
  }

  async todaySessionExistCheck(user: UserSub): Promise<boolean> {
    const userId = await this.userRepository.findUserIdByCognitoId(user.sub);
    const today = moment().tz("Asia/Seoul").format("YYYY-MM-DD");
    const session = await this.sessionRepository.findSessionByDate(userId, today);

    return !!session;
  }
}
