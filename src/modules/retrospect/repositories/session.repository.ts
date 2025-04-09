import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Raw, Repository, DeleteResult, In } from "typeorm";
import * as moment from "moment-timezone";
import { RetrospectQuestion } from "../entities/question.entity";
import { RetrospectSession } from "../entities/session.entity";
import { User } from "src/modules/user/entity/user.entity";

@Injectable()
export class RetrospectSessionRepository {
  constructor(
    @InjectRepository(RetrospectSession)
    private readonly sessionRepository: Repository<RetrospectSession>
  ) { }

  /**
  * 특정 사용자의 특정 날짜에 해당하는 세션 조회 (KST 기준)
  * @param userId 사용자 ID
  * @param date 조회할 날짜 (YYYY-MM-DD)
  * @returns 조회된 RetrospectSession 또는 null
  */
  async findSessionByDate(userId: number, date: string): Promise<RetrospectSession | null> {
    const startOfDay = moment.tz(date, 'Asia/Seoul').startOf('day').toDate();
    const endOfDay = moment.tz(date, 'Asia/Seoul').endOf('day').toDate();
    return await this.sessionRepository.findOne({
      where: {
        user: { id: userId },
        created_at: Raw(alias => `${alias} BETWEEN :start AND :end`, { start: startOfDay, end: endOfDay }),
      },
      relations: ['answers', 'questions', 'goals'],
    });
  }

  /**
  * 세션 ID로 세션 조회
  * @param sessionId 세션 ID
  * @returns 조회된 RetrospectSession 또는 null
  */
  async findSessionById(sessionId: number): Promise<RetrospectSession | null> {
    return await this.sessionRepository.findOne({
      where: { id: sessionId },
      relations: ['user'],
    });
  }

  /**
  * 특정 사용자의 새로운 회고 세션 생성
  * @param userId 사용자 ID
  * @returns 생성된 RetrospectSession
  */
  async createSession(userId: number): Promise<RetrospectSession> {
    const newSession = this.sessionRepository.create({
      user: { id: userId } as User,
      date: moment().format('YYYY-MM-DD')
    });
    return await this.sessionRepository.save(newSession);
  }

  /**
  * 세션 ID로 세션 삭제 (회고 설정 변경 시 삭제)
  * @param sessionId 세션 ID
  * @returns 삭제 결과 (DeleteResult)
  */
  async deleteSessionById(sessionId: number): Promise<DeleteResult> {
    return await this.sessionRepository.delete(sessionId);
  }

  /**
  * 특정 세션에 질문 목록 연결
  * @param sessionId 세션 ID
  * @param questions 연결할 질문 목록
  * @returns 업데이트된 RetrospectSession
  * @throws NotFoundException 세션을 찾지 못한 경우
  */
  async saveSessionQuestions(session: RetrospectSession, questions: RetrospectQuestion[]): Promise<RetrospectSession> {
    session.questions = questions;
    return await this.sessionRepository.save(session);
  }

  /**
  * 어제 생성된 모든 세션의 ID 목록 조회 (KST 기준)
  * @returns 어제 생성된 세션 ID 배열
  */
  async findYesterdaySessionIds(): Promise<number[]> {
    const yesterday = moment.tz('Asia/Seoul').subtract(1, 'day');
    const startOfYesterday = yesterday.startOf('day').toDate();
    const endOfYesterday = yesterday.endOf('day').toDate();

    const sessions = await this.sessionRepository
      .createQueryBuilder('session')
      .select('session.id', 'id')
      .where('session.created_at BETWEEN :start AND :end',
        { start: startOfYesterday, end: endOfYesterday })
      .getRawMany<{ id: number }>();

    return sessions.map(result => result.id);
  }

  /**
  * 세션 ID로 세션의 상세 정보 조회(사용자 정보 제외, 주요 관계 포함)
  * @param sessionId 세션 ID
  * @returns 상세 정보가 포함된 RetrospectSession 또는 null
  */
  async findSessionDetailByIdWithRelations(sessionId: number): Promise<RetrospectSession | null> {
    return await this.sessionRepository.findOne({
      where: { id: sessionId },
      relations: ['answers', 'answers.question', 'questions', 'user', 'goals'],
    });
  }

  /**
  * 여러 세션 ID에 해당하는 세션 상세 정보를 한 번의 쿼리로 조회
  * @param sessionIds 조회할 세션 ID 배열
  * @returns 상세 정보가 포함된 RetrospectSession 배열
  */
  async findSessionsByIdsWithRelations(sessionIds: number[]): Promise<RetrospectSession[]> {
    if (sessionIds.length === 0) {
      return [];
    }
    return await this.sessionRepository.find({
      where: { id: In(sessionIds) },
      relations: ['answers', 'answers.question', 'questions', 'user', 'goals'],
    });
  }

  /**
  * 특정 사용자가 작성한 모든 회고 세션의 날짜 목록 조회 (내림차순 정렬)
  * @param userId 사용자 ID
  * @returns 회고 작성 날짜(Date 객체) 배열
  */
  async findSessionDates(userId: number): Promise<Date[]> {
    const sessions = await this.sessionRepository.find({
      where: { user: { id: userId } },
      select: ['created_at'],
      order: { created_at: 'DESC' },
    });
    return sessions.map(session => session.created_at);
  }
}