import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import * as moment from "moment";
import { RetrospectQuestion } from "../entities/question.entity";
import { RetrospectQuestionUsage } from "../entities/question-usage.entity";
import { RetrospectConceptEnum } from "../enums/retrospect-concept.enum";

@Injectable()
export class RetrospectQuestionRepository {
  constructor(
    @InjectRepository(RetrospectQuestion)
    private readonly questionRepository: Repository<RetrospectQuestion>,
    @InjectRepository(RetrospectQuestionUsage)
    private readonly questionUsageRepository: Repository<RetrospectQuestionUsage>
  ) { }

  async findCommonQuestion() {
    return await this.questionRepository
      .createQueryBuilder('question')
      .where('question.concept = :concept', { concept: RetrospectConceptEnum.COMMON })
      .orderBy('RAND()')
      .getOne();
  }

  async findGoalQuestion() {
    return await this.questionRepository
      .createQueryBuilder('question')
      .where('question.concept = :concept', { concept: RetrospectConceptEnum.GOAL })
      .getOne();
  }

  async findFilteredQuestionsByConcept(concept: string, filterPeriodDays: number): Promise<RetrospectQuestion[]> {
    const filterDate = moment().subtract(filterPeriodDays, 'days').format('YYYY-MM-DD HH:mm:ss');
    return this.questionRepository
      .createQueryBuilder('question')
      .leftJoinAndSelect('question.usage', 'usage')
      .where('question.concept = :concept', { concept })
      .andWhere('(usage.last_used_at < :filterDate OR usage.last_used_at IS NULL)', { filterDate })
      .getMany();
  }

  async updateQuestionsUsage(session, questions: RetrospectQuestion[], userId: number) {
    const now = new Date();
    for (const question of questions) {
      let usage = await this.questionUsageRepository.findOne({
        where: {
          user: { id: userId },
          question: { id: question.id }
        }
      });
      if (!usage) {
        usage = this.questionUsageRepository.create({
          user: { id: userId },
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