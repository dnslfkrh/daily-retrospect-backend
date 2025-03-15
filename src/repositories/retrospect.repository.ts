import { InjectRepository } from "@nestjs/typeorm";
import { Retrospect } from "src/entities/retrospect.entity";
import { Repository } from "typeorm";
import * as moment from "moment";
import { Injectable, NotFoundException } from "@nestjs/common";

@Injectable()
export class RetrospectRepository {
  constructor(
    @InjectRepository(Retrospect)
    private readonly retrospectRepository: Repository<Retrospect>
  ) { }

  private getTodayDate(): string {
    return moment().format("YYYY-MM-DD");
  }

  async findTodayRetroSpect(id: number): Promise<Retrospect | null> {
    return await this.retrospectRepository.findOne({
      where: { date: this.getTodayDate(), user: { id } },
      relations: ["user", "goal"],
    });
  }

  async createStep1(id: number, mood: string): Promise<Retrospect> {
    const newRetrospect = this.retrospectRepository.create({
      date: this.getTodayDate(),
      mood,
      user: { id },
    });

    return await this.retrospectRepository.save(newRetrospect);
  }

  async addStep2(id: number, highlight: string): Promise<Retrospect> {
    const retrospect = await this.findTodayRetroSpect(id);

    if (!retrospect) {
      throw new NotFoundException("회고가 존재하지 않습니다. 먼저 Step1을 완료하세요.");
    }

    retrospect.highlight = highlight;

    return await this.retrospectRepository.save(retrospect);
  }

  async addStep3(id: number, keywords: string[]): Promise<Retrospect> {
    const retrospect = await this.findTodayRetroSpect(id);

    if (!retrospect) {
      throw new NotFoundException("회고가 존재하지 않습니다. 먼저 Step1을 완료하세요.");
    }

    retrospect.keywords = keywords;
    return await this.retrospectRepository.save(retrospect);
  }

  async addStep4(id: number, resolution: string): Promise<Retrospect> {
    const retrospect = await this.findTodayRetroSpect(id);

    if (!retrospect) {
      throw new NotFoundException("회고가 존재하지 않습니다. 먼저 Step1을 완료하세요.");
    }

    retrospect.lesson = resolution;
    return await this.retrospectRepository.save(retrospect);
  }

  async addStep5(id: number, comment: string): Promise<Retrospect> {
    const retrospect = await this.findTodayRetroSpect(id);

    if (!retrospect) {
      throw new NotFoundException("회고가 존재하지 않습니다. 먼저 Step1을 완료하세요.");
    }

    retrospect.comment = comment;
    return await this.retrospectRepository.save(retrospect);
  }
}
