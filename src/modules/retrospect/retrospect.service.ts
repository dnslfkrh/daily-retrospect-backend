import { ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
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

  private getConceptsBySetting(setting: RetrospectSettingDto) {
    const conceptWeights = {
      'emotion': ['emotion', 'event', 'reflection'],
      'event': ['event', 'emotion', 'reflection'],
      'reflection': ['reflection', 'event', 'emotion'],
    };
    return conceptWeights[setting.concept] || [];
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
      if (!session) continue;

      const activeGoals = await this.getActiveGoals(session.user.id);
      const sessionData = this.formatSessionData(session, activeGoals);

      if (sessionData.answers.length > 0) {
        detailedSessions.push(sessionData);
      }
    }

    return detailedSessions;
  }

  private async getSessionDetail(sessionId: number) {
    return this.retrospectRepository.findSessionDetailByIdWithOutUser(sessionId);
  }

  private async getActiveGoals(userId: number) {
    return this.goalService.getActiveGoals(userId, moment().format('YYYY-MM-DD'));
  }

  private formatSessionData(session: any, activeGoals: any[]) {
    return {
      userId: session.user.id,
      sessionId: session.id,
      answers: session.answers.map(answer => ({
        question: answer.question.question_text,
        answer: answer.answer,
      })),
      activeGoals: activeGoals.map(goal => goal.title),
    };
  }
}