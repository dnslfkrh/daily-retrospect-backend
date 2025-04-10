import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Between, Repository } from "typeorm";
import { subDays, startOfDay, endOfDay } from "date-fns";
import { RetrospectSummary } from "../entities/summary.entity";

@Injectable()
export class RetrospectSummaryRepository {
  constructor(
    @InjectRepository(RetrospectSummary)
    private readonly summaryRepository: Repository<RetrospectSummary>
  ) { }

  /**
  * AI 회고 요약 저장, 어제 작성된 회고를 정리하는 거라 어제 날짜로 저장
  * @param sessionId 세션 ID
  * @param userId 사용자 ID
  * @param summary 요약 내용
  * @returns 저장된 RetrospectSummary 엔티티
  */
  async saveSummary(sessionId: number, userId: number, summary: string): Promise<RetrospectSummary> {
    const newSummary = this.summaryRepository.create({
      session: { id: sessionId },
      user: { id: userId },
      summary,
      created_at: subDays(new Date(), 1) // 회고 작성 당일로 저장
    });

    return await this.summaryRepository.save(newSummary);
  }

  /**
  * 특정 사용자의 특정 날짜에 해당하는 요약 내용 조회
  * @param userId 사용자 ID
  * @param date 조회할 날짜 (YYYY-MM-DD)
  * @returns 요약 내용 문자열 또는 null
  */
  async findSummaryByUserAndDate(userId: number, date: string): Promise<string | null> {
    try {
      const parsedDate = new Date(date);
      if (isNaN(parsedDate.getTime())) {
        throw new Error(`Invalid date format: ${date}. Expected format YYYY-MM-DD`);
      }

      const startDate = startOfDay(parsedDate);
      const endDate = endOfDay(parsedDate);

      const summary = await this.summaryRepository.findOne({
        where: {
          user: { id: userId },
          created_at: Between(startDate, endDate),
        },
        relations: ['user']
      });

      return summary ? summary.summary : null;
    } catch (error) {
      console.error('Error finding summary by date:', error.message);
      return null;
    }
  }

  /**
  * 특정 사용자의 가장 최근 회고 요약 조회
  * @param userId 사용자 ID
  * @returns 가장 최근 RetrospectSummary 또는 null
  */
  async findLastSummary(userId: number): Promise<RetrospectSummary | null> {
    try {
      return await this.summaryRepository.findOne({
        where: {
          user: { id: userId },
        },
        relations: ['user'],
        order: { created_at: 'DESC' },
      });
    } catch (error) {
      console.error('Error finding last summary:', error.message);
      return null;
    }
  }
}