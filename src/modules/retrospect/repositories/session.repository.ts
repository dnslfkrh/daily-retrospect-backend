import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Raw, Repository } from "typeorm";
import * as moment from "moment-timezone";
import { RetrospectQuestion } from "../entities/question.entity";
import { RetrospectSession } from "../entities/session.entity";

@Injectable()
export class RetrospectSessionRepository {
  constructor(
    @InjectRepository(RetrospectSession)
    private readonly sessionRepository: Repository<RetrospectSession>
  ) {}

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

  async findYesterdayAnswers() {
    const yesterday = moment().tz('Asia/Seoul').subtract(1, 'day');
    const startOfYesterday = yesterday.startOf('day').format('YYYY-MM-DD HH:mm:ss');
    const endOfYesterday = yesterday.endOf('day').format('YYYY-MM-DD HH:mm:ss');

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

  async findSessionDates(userId: number) {
    const retrospects = await this.sessionRepository.find({
      where: { user: { id: userId } },
      select: ['created_at'],
      order: { created_at: 'DESC' },
    });
    return retrospects.map(session => session.created_at);
  }
}