import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Between, Repository } from "typeorm";
import { subDays } from "date-fns";
import * as moment from "moment";
import { RetrospectSummary } from "../entities/summary.entity";

@Injectable()
export class RetrospectSummaryRepository {
  constructor(
    @InjectRepository(RetrospectSummary)
    private readonly summaryRepository: Repository<RetrospectSummary>
  ) {}

  async saveSummary(sessionId: number, userId: number, summary: string) {
    const newSummary = this.summaryRepository.create({
      session: { id: sessionId },
      user: { id: userId },
      summary,
      created_at: subDays(new Date(), 1)
    });
    return await this.summaryRepository.save(newSummary);
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

  async findLastSummary(userId: number): Promise<RetrospectSummary | null> {
    const lastSummary = await this.summaryRepository.findOne({
      where: {
        user: { id: userId },
      },
      order: { created_at: 'DESC' },
    });
    return lastSummary ? lastSummary : null;
  }
}