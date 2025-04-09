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

@Injectable()
export class RetrospectSessionService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly sessionRepository: RetrospectSessionRepository,
    private readonly answerRepository: RetrospectAnswerRepository,
    private readonly settingRepository: RetrospectSettingRepository,
    private readonly questionService: RetrospectQuestionService,
    private readonly goalService: GoalService
  ) {}

  async findOrCreateSession(user: UserSub) {
    const userId = await this.userRepository.findUserIdByCognitoId(user.sub);
    const today = moment().format('YYYY-MM-DD');

    let session = await this.sessionRepository.findSessionByDate(userId, today);
    if (!session) {
      session = await this.createSessionWithQuestions(userId);
    }

    const [activeGoals, goalQuestion] = await Promise.all([
      this.goalService.getActiveGoals(userId, today),
      this.questionService.findGoalQuestion()
    ]);

    session.goals = activeGoals;

    if (activeGoals.length > 0 && goalQuestion) {
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

    return transformedSession;
  }

  private async createSessionWithQuestions(userId: number) {
    const setting = await this.settingRepository.findSetting(userId);
    const questions = await this.questionService.selectQuestionsForSession(setting, userId);
    const newSession = await this.sessionRepository.createSession(userId);

    await Promise.all([
      this.sessionRepository.saveSessionQuestions(newSession.id, questions),
      this.questionService.updateQuestionsUsage(newSession, questions, userId)
    ]);

    newSession.questions = questions;
    return newSession;
  }

  async saveAnswer(user: UserSub, sessionId: number, saveAnswerDto: RetrospectAnswerDto) {
    const { questionId, answer } = saveAnswerDto;
    const userId = await this.userRepository.findUserIdByCognitoId(user.sub);
    const session = await this.sessionRepository.findSessionById(sessionId);
    
    if (!session || session.user.id !== userId) {
      throw new NotFoundException('No session found');
    }
    
    if (!isSameDay(session.created_at, new Date())) {
      throw new ForbiddenException('Retrospect can only be edited on the same day.');
    }
    
    return await this.answerRepository.saveAnswer(session.id, questionId, answer);
  }

  async getSessionDates(user: UserSub) {
    const userId = await this.userRepository.findUserIdByCognitoId(user.sub);
    return await this.sessionRepository.findSessionDates(userId);
  }

  async getYesterdayAnswers() {
    const sessionIds = await this.sessionRepository.findYesterdayAnswers();
    if (sessionIds.length === 0) {
      return [];
    }
    
    const detailedSessions = [];
    for (const sessionId of sessionIds) {
      const session = await this.sessionRepository.findSessionDetailByIdWithOutUser(sessionId);
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

  private formatSessionData(session) {
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
}