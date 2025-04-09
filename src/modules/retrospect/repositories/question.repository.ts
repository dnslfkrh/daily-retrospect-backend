import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import * as moment from "moment";
import { RetrospectQuestion } from "../entities/question.entity";
import { RetrospectQuestionUsage } from "../entities/question-usage.entity";
import { RetrospectConceptEnum } from "../enums/retrospect-concept.enum";
import { User } from "src/modules/user/entity/user.entity";
import { RetrospectSession } from "../entities/session.entity";

@Injectable()
export class RetrospectQuestionRepository {
  constructor(
    @InjectRepository(RetrospectQuestion)
    private readonly questionRepository: Repository<RetrospectQuestion>,
    @InjectRepository(RetrospectQuestionUsage)
    private readonly questionUsageRepository: Repository<RetrospectQuestionUsage>
  ) { }

  /**
  * "공통" 질문 중 하나를 무작위로 조회
  * @returns 조회된 RetrospectQuestion
  */
  async findCommonQuestion(): Promise<RetrospectQuestion> {
    return await this.questionRepository
      .createQueryBuilder('question')
      .where('question.concept = :concept', { concept: RetrospectConceptEnum.COMMON })
      .orderBy('RAND()')
      .getOne();
  }

  /**
  * 목표 관련 질문 조회 (현재는 목표 질문이 하나만 있어서 getOne 사용)
  * @returns 조회된 RetrospectQuestion
  */
  async findGoalQuestion(): Promise<RetrospectQuestion> {
    return await this.questionRepository
      .createQueryBuilder('question')
      .where('question.concept = :concept', { concept: RetrospectConceptEnum.GOAL })
      // .orderBy('RAND()') // 목표 질문이 여러 개일 경우 랜덤 또는 다른 로직 추가 필요
      .getOne();
  }

  /**
  * 특정 컨셉의 질문들 중 일정 기간 사용되지 않은 질문들 조회
  * @param concept 질문 컨셉
  * @param filterPeriodDays 필터링할 기간 (일)
  * @returns 필터링된 RetrospectQuestion 배열
  */
  async findFilteredQuestionsByConcept(concept: RetrospectConceptEnum, filterPeriodDays: number): Promise<RetrospectQuestion[]> {
    const filterDate = moment().subtract(filterPeriodDays, 'days').toDate();

    return this.questionRepository
      .createQueryBuilder('question')
      .leftJoinAndSelect('question.usage', 'usage')
      .where('question.concept = :concept', { concept })
      .andWhere('(usage.last_used_at < :filterDate OR usage.last_used_at IS NULL)', { filterDate })
      .getMany();
  }

  /**
  * 질문 사용 내역(횟수, 마지막 사용 시각) 반영
  * @param session 현재 회고 세션
  * @param questions 사용된 질문 목록
  * @param userId 사용자 ID
  */
  async updateQuestionsUsage(session: RetrospectSession, questions: RetrospectQuestion[], userId: number): Promise<void> {
    const now = new Date();

    for (const question of questions) {
      let usage = await this.questionUsageRepository.findOne({
        where: {
          user: { id: userId },
          question: { id: question.id }
        },
        relations: ['user', 'question']
      });

      if (!usage) {
        usage = this.questionUsageRepository.create({
          user: { id: userId } as User,
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