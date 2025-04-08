import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Between, Raw, Repository } from "typeorm";
import * as moment from "moment-timezone";
import { subDays } from "date-fns";
import { RetrospectConcept, RetrospectVolume } from "../enums/retrospect.enum";
import { RetrospectSettingDto } from "../dto/setting.dto";
import { RetrospectQuestion } from "../entities/question.entity";
import { RetrospectSetting } from "../entities/setting.entity";
import { RetrospectAnswer } from "../entities/answer.entity";
import { RetrospectSession } from "../entities/session.entity";
import { RetrospectSummary } from "../entities/summary.entity";
import { RetrospectQuestionUsage } from "../entities/question-usage.entity";

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
    private readonly answerRepository: Repository<RetrospectAnswer>,
    @InjectRepository(RetrospectSummary)
    private readonly summaryRepository: Repository<RetrospectSummary>,
    @InjectRepository(RetrospectQuestionUsage)
    private readonly questionUsageRepository: Repository<RetrospectQuestionUsage>
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
    const startOfDay = moment.tz(date, 'Asia/Seoul').startOf('day').format('YYYY-MM-DD HH:mm:ss');
    const endOfDay = moment.tz(date, 'Asia/Seoul').endOf('day').format('YYYY-MM-DD HH:mm:ss');
    return await this.sessionRepository.findOne({
      where: {
        user: { id: userId },
        created_at: Raw(alias => `${alias} BETWEEN :start AND :end`, { start: startOfDay, end: endOfDay }),
      },
      relations: ['answers', 'questions'],
    });
  }

  async findSessionById(sessionId: number) {
    return await this.sessionRepository.findOne({
      where: { id: sessionId },
      relations: ['user'],
    });
  }

  async createSession(userId: number) {
    const newSession = this.sessionRepository.create({
      user: { id: userId },
      date: moment().format('YYYY-MM-DD')
    });
    return await this.sessionRepository.save(newSession);
  }

  async deleteSessionById(sessionId: number) {
    return await this.sessionRepository.delete(sessionId);
  }

  async findCommonQuestion() {
    return await this.questionRepository
      .createQueryBuilder('question')
      .where('question.concept = :concept', { concept: RetrospectConcept.COMMON })
      .orderBy('RAND()')
      .getOne();
  }

  async findGoalQuestion() {
    return await this.questionRepository
      .createQueryBuilder('question')
      .where('question.concept = :concept', { concept: RetrospectConcept.GOAL })
      .getOne();
  }

  async findQuestionsByConcept(concept: string, limit: number) {
    return await this.questionRepository
      .createQueryBuilder('question')
      .where('question.concept = :concept', { concept })
      .orderBy('RAND()')
      .limit(limit)
      .getMany();
  }

  // 최근 사용되지 않은 질문 가져오기
  async findFilteredQuestionsByConcept(concept: string, filterPeriodDays: number): Promise<RetrospectQuestion[]> {
    const filterDate = moment().subtract(filterPeriodDays, 'days').format('YYYY-MM-DD HH:mm:ss');
    return this.questionRepository
      .createQueryBuilder('question')
      .leftJoinAndSelect('question.usage', 'usage')
      .where('question.concept = :concept', { concept })
      .andWhere('(usage.last_used_at < :filterDate OR usage.last_used_at IS NULL)', { filterDate })
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
    return await this.sessionRepository.save(session);
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
    const yesterday = moment().tz('Asia/Seoul').subtract(1, 'day');
    const startOfYesterday = yesterday.startOf('day').format('YYYY-MM-DD HH:mm:ss');
    const endOfYesterday = yesterday.endOf('day').format('YYYY-MM-DD HH:mm:ss');

    console.log('startOfYesterday', startOfYesterday);
    console.log('endOfYesterday', endOfYesterday);

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
    return await this.sessionRepository.findOne({
      where: { id: sessionId },
      relations: ['answers', 'answers.question', 'questions', 'user', 'goals'],
    });
  }

  async saveSummary(sessionId: number, userId: number, summary: string) {
    const newSummary = this.summaryRepository.create({
      session: { id: sessionId },
      user: { id: userId },
      summary,
      created_at: subDays(new Date(), 1)
    });
    return await this.summaryRepository.save(newSummary);
  }

  async findSessionDates(userId: number) {
    const retrospects = await this.sessionRepository.find({
      where: { user: { id: userId } },
      select: ['created_at'],
      order: { created_at: 'DESC' },
    });
    return retrospects.map(session => session.created_at);
  }

  async findSummaryByUserAndDate(userId: number, date: string) {
    const summary = await this.summaryRepository.findOne({
      where: {
        user: { id: userId },
        created_at: Between(moment(date).startOf('day').toDate(), moment(date).endOf('day').toDate()),
      },
    });
    return summary ? summary.summary : null;
  }

  async findGoalEvaluationAnswers(userId: number, startDate: Date, endDate: Date) {
    return await this.answerRepository
      .createQueryBuilder("answer")
      .innerJoinAndSelect("answer.question", "question")
      .innerJoin("answer.session", "session")
      .where("session.userId = :userId", { userId })
      .andWhere("question.is_goal_evaluation = true")
      .andWhere("answer.created_at BETWEEN :start AND :end", { start: startDate, end: endDate })
      .getMany();
  }

  async findLastSummary(userId: number): Promise<RetrospectSummary | null> {
    const lastSummary = await this.summaryRepository.findOne({
      where: {
        user: { id: userId },
      },
      order: { created_at: 'DESC' },
    });
    return lastSummary ? lastSummary : null;
  }

  // 선택된 질문들의 사용량 업데이트
  async updateQuestionsUsage(session: RetrospectSession, questions: RetrospectQuestion[]) {
    const now = new Date();
    for (const question of questions) {
      let usage = await this.questionUsageRepository.findOne({
        where: {
          user: { id: session.user.id },
          question: { id: question.id }
        }
      });
      if (!usage) {
        usage = this.questionUsageRepository.create({
          user: session.user,
          session: session,
          question: question,
          usage_count: 1,
          last_used_at: now
        });
      } else {
        usage.usage_count += 1;
        usage.last_used_at = now;
        usage.session = session;
      }
      await this.questionUsageRepository.save(usage);
    }
  }
}
