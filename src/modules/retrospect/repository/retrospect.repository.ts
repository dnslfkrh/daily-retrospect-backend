import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Raw, Repository } from "typeorm";
import * as moment from "moment";
import { RetrospectQuestion } from "../entities/question.entity";
import { RetrospectSetting } from "../entities/setting.entity";
import { RetrospectAnswer } from "../entities/answer.entity";
import { RetrospectSession } from "../entities/session.entity";
import { RetrospectSettingDto } from "../dto/setting.dto";
import { RetrospectConcept, RetrospectVolume } from "../enums/retrospect.enum";
import { Goal } from "src/modules/goal/entity/goal.entity";
import { User } from "src/modules/user/entity/user.entity";

@Injectable()
export class RetrospectRepository {
  constructor(
    @InjectRepository(RetrospectSetting)
    private readonly settingRepository: Repository<RetrospectSetting>,
    @InjectRepository(RetrospectSession)
    private readonly sessionRepository: Repository<RetrospectSession>,
    @InjectRepository(RetrospectQuestion)
    private readonly questionRepository: Repository<RetrospectQuestion>,
    @InjectRepository(RetrospectAnswer)
    private readonly answerRepository: Repository<RetrospectAnswer>
  ) { }

  async findSetting(userId: number): Promise<RetrospectSettingDto> {
    const setting = await this.settingRepository.findOne({ where: { user: { id: userId } } });

    if (!setting) {
      return { concept: RetrospectConcept.EVENT, volume: RetrospectVolume.STANDARD };
    }

    return {
      concept: setting.concept,
      volume: setting.volume,
    };
  }

  async setSetting(userId: number, settingDto: RetrospectSettingDto) {
    let existingSetting = await this.settingRepository.findOne({ where: { user: { id: userId } } });

    if (existingSetting) {
      await this.settingRepository.update(existingSetting.id, settingDto);
    } else {
      existingSetting = this.settingRepository.create({ ...settingDto, user: { id: userId } });
      await this.settingRepository.save(existingSetting);
    }

    return existingSetting;
  }

  async findSessionByDate(userId: number, date: string) {
    const startOfDay = moment(date).startOf('day').toISOString();
    const endOfDay = moment(date).endOf('day').toISOString();

    return this.sessionRepository.findOne({
      where: {
        user: { id: userId },
        created_at: Raw(alias => `${alias} BETWEEN :start AND :end`, { start: startOfDay, end: endOfDay }),
      },
      relations: ['answers', 'questions'],
    });
  }

  async findSessionById(sessionId: number) {
    return this.sessionRepository.findOne({
      where: { id: sessionId },
      relations: ['user'],
    });
  }

  async createSession(userId: number,) {
    const newSession = this.sessionRepository.create({
      user: { id: userId }
    });
    return await this.sessionRepository.save(newSession);
  }

  async findCommonQuestion() {
    return this.questionRepository
      .createQueryBuilder('question')
      .where('question.concept = :concept', { concept: RetrospectConcept.COMMON })
      .orderBy('RAND()')
      .getOne();
  }

  async findGoalQuestion() {
    return this.questionRepository
      .createQueryBuilder('question')
      .where('question.concept = :concept', { concept: RetrospectConcept.GOAL })
      .getOne();
  }

  async findQuestionsByConcept(concept: string, limit: number) {
    return this.questionRepository
      .createQueryBuilder('question')
      .where('question.concept = :concept', { concept })
      .orderBy('RAND()')
      .limit(limit)
      .getMany();
  }

  async saveSessionQuestions(sessionId: number, questions: RetrospectQuestion[]) {
    const session = await this.sessionRepository.findOne({
      where: { id: sessionId },
      relations: ['questions']
    });

    if (!session) {
      throw new NotFoundException('Session not found');
    }

    session.questions = questions;
    return this.sessionRepository.save(session);
  }

  async saveAnswer(sessionId: number, questionId: number, answer: string) {
    const existingAnswer = await this.answerRepository.findOne({
      where: { session: { id: sessionId }, question: { id: questionId } },
      relations: ["session", "question"],
    });

    if (!existingAnswer) {
      const newAnswer = this.answerRepository.create({
        session: { id: sessionId },
        question: { id: questionId },
        answer,
      });
      return await this.answerRepository.save(newAnswer);
    }

    if (existingAnswer.answer !== answer) {
      existingAnswer.answer = answer;
      return await this.answerRepository.save(existingAnswer);
    }

    return existingAnswer;
  }

  async findYesterdayAnswers() {
    const yesterday = moment().subtract(1, 'day');
    const startOfYesterday = yesterday.startOf('day').toISOString();
    const endOfYesterday = yesterday.endOf('day').toISOString();

    const sessionIds = await this.sessionRepository
      .createQueryBuilder('session')
      .select('session.id')
      .where('session.created_at BETWEEN :start AND :end',
        { start: startOfYesterday, end: endOfYesterday })
      .getMany()
      .then(results => results.map(result => result.id));

    return sessionIds;
  }

  async findSessionDetailByIdWithOutUser(sessionId: number) {
    return this.sessionRepository.findOne({
      where: { id: sessionId },
      relations: ['answers', 'answers.question', 'questions', 'user', 'goals'],
    });
  }
}