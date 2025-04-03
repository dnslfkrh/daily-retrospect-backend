import { ForbiddenException, Injectable, NotFoundException, UnauthorizedException } from "@nestjs/common";
import { UserSub } from "src/common/types/Payload";
import { RetrospectRepository } from "src/modules/retrospect/repository/retrospect.repository";
import { UserRepository } from "src/modules/user/repository/user.repository";
import { RetrospectSettingDto } from "./dto/setting.dto";
import * as moment from "moment";
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
  constructor(
    private readonly userRepository: UserRepository,
    private readonly retrospectRepository: RetrospectRepository,
    private readonly goalService: GoalService
  ) { }

  async getSetting(user: UserSub) {
    const userId = await this.userRepository.findUserIdByCognitoId(user.sub);
    return await this.retrospectRepository.findSetting(userId);
  }

  async setSetting(user: UserSub, setting: RetrospectSettingDto) {
    const userId = await this.userRepository.findUserIdByCognitoId(user.sub);
    return await this.retrospectRepository.setSetting(userId, setting);
  }

  async findOrCreateSession(user: UserSub) {
    const userId = await this.userRepository.findUserIdByCognitoId(user.sub);
    let session = await this.retrospectRepository.findSessionByDate(userId, moment().format('YYYY-MM-DD'));

    if (!session) {
      session = await this.createSessionWithQuestions(userId);
    }

    const activeGoals = await this.goalService.getActiveGoals(userId, moment().format('YYYY-MM-DD'));
    session.goals = activeGoals;

    if (activeGoals.length > 0) {
      const goalQuestion = await this.retrospectRepository.findGoalQuestion();
      if (goalQuestion) {
        session.questions.push(goalQuestion);
      }
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

    return transformedSession;
  }

  private async createSessionWithQuestions(userId: number) {
    const setting = await this.retrospectRepository.findSetting(userId);
    const concepts = this.getConceptsBySetting(setting);

    const [mainCount, subCount1, subCount2] = CONCEPT_RATIOS[setting.volume as RetrospectVolume];

    const questions: RetrospectQuestion[] = await Promise.all(
      [
        await this.retrospectRepository.findCommonQuestion(),
        ...await this.retrospectRepository.findQuestionsByConcept(concepts[0], mainCount),
        ...await this.retrospectRepository.findQuestionsByConcept(concepts[1], subCount1),
        ...await this.retrospectRepository.findQuestionsByConcept(concepts[2], subCount2),
      ]
    );

    const newSession = await this.retrospectRepository.createSession(userId);

    await this.retrospectRepository.saveSessionQuestions(newSession.id, questions);

    newSession.questions = questions;

    return newSession;
  }

  async saveAnswer(user: UserSub, sessionId: number, saveAnswerDto: RetrospectAnswerDto) {
    const { questionId, answer } = saveAnswerDto;

    const userId = await this.userRepository.findUserIdByCognitoId(user.sub);
    const session = await this.retrospectRepository.findSessionById(sessionId);

    if (!session || session.user.id !== userId) {
      throw new NotFoundException('No session found');
    }

    if (!isSameDay(session.created_at, new Date())) {
      throw new ForbiddenException('Retrospect can only be edited on the same day.');
    }

    return await this.retrospectRepository.saveAnswer(session.id, questionId, answer);
  }

  async getYesterdayAnswers() {
    const sessionIds = await this.retrospectRepository.findYesterdayAnswers();

    if (sessionIds.length === 0) {
      return [];
    }

    const detailedSessions = [];
    for (const sessionId of sessionIds) {
      const session = await this.getSessionDetail(sessionId);
      if (!session) {
        continue;
      }

      const sessionData = this.formatSessionData(session);

      if (sessionData.answers.length > 0) {
        detailedSessions.push(sessionData);
      }
    }

    return detailedSessions;
  }

  async saveSummary(sessionId: number, userId: number, summary: string) {
    const session = await this.retrospectRepository.findSessionById(sessionId);

    if (!session) {
      throw new NotFoundException('Session not found');
    }

    if (session.user.id !== userId) {
      throw new UnauthorizedException('You do not have permission to add summary to this session');
    }

    return await this.retrospectRepository.saveSummary(sessionId, userId, summary);
  }


  private getConceptsBySetting(setting: RetrospectSettingDto) {
    const conceptWeights = {
      'emotion': ['emotion', 'event', 'reflection'],
      'event': ['event', 'emotion', 'reflection'],
      'reflection': ['reflection', 'event', 'emotion'],
    };
    return conceptWeights[setting.concept] || [];
  }

  private async getSessionDetail(sessionId: number) {
    return await this.retrospectRepository.findSessionDetailByIdWithOutUser(sessionId);
  }

  // private async getActiveGoals(userId: number) {
  //   return await this.goalService.getActiveGoals(userId, moment().format('YYYY-MM-DD'));
  // }

  private formatSessionData(session: RetrospectSession) {
    return {
      userId: session.user.id,
      sessionId: session.id,
      answers: session.answers
        .filter(answer => answer.question.id !== 36)
        .map(answer => ({
          question: answer.question.question_text,
          answer: answer.answer,
        })),
    };
  }

  async getSessionDates(user: UserSub) {
    const userId = await this.userRepository.findUserIdByCognitoId(user.sub);
    return await this.retrospectRepository.findSessionDates(userId);
  }

  async getSummary(user: UserSub, date: string) {
    const kstDateFromClient = moment(date, "ddd MMM DD YYYY HH:mm:ss [GMT]ZZ (z)");
    const formattedDate = kstDateFromClient.format();

    const userId = await this.userRepository.findUserIdByCognitoId(user.sub);
    return await this.retrospectRepository.findSummaryByUserAndDate(userId, formattedDate);
  }

  async getGoalEvaluationAnswers(user: UserSub, period: string) {
    const userId = await this.userRepository.findUserIdByCognitoId(user.sub);
    const { startDate, endDate } = this.getPeriodRange(period);

    const answers = await this.retrospectRepository.findGoalEvaluationAnswers(userId, startDate, endDate);

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
        throw new Error("Invalid period");
    }

    return { startDate, endDate };
  }
}