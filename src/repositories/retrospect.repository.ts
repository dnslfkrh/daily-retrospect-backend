import { InjectRepository } from "@nestjs/typeorm";
import { Retrospect } from "src/entities/retrospect.entity";
import { Repository } from "typeorm";
import * as moment from "moment";
import { Injectable } from "@nestjs/common";

@Injectable()
export class RetrospectRepository {
  constructor(
    @InjectRepository(Retrospect)
    private readonly retrospectRepository: Repository<Retrospect>
  ) { }

  async findTodayRetroSpect(id: number): Promise<Retrospect | null> {
    const today = moment().format("YYYY-MM-DD");

    return await this.retrospectRepository.findOne({
      where: { date: today, user: { id: id } },
      relations: ["user", "goal"],
    });
  }
}