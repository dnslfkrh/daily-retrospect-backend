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
    return this.sessionRepository.findOne({
      where: {
        user: { id: userId },
        created_at: Raw(alias => `DATE(${alias}) = :date`, { date }),
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

  async createSession(userId: number) {
    const newSession = this.sessionRepository.create({ user: { id: userId } });
    return this.sessionRepository.save(newSession);
  }

  async findCommonQuestion() {
    return this.questionRepository
      .createQueryBuilder('question')
      .where('question.concept = :concept', { concept: RetrospectConcept.COMMON })
      .orderBy('RAND()')
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
}