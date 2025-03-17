import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Goal } from "src/entities/goal.entity";
import { Repository } from "typeorm";

@Injectable()
export class GoalRepository {
  constructor(
    @InjectRepository(Goal)
    private readonly goalRepository: Repository<Goal>
  ) { }

  async getActivatedGoals(userId: number): Promise<Goal[] | null> {
    return this.goalRepository
      .createQueryBuilder("goal")
      .where("goal.user.id = :userId", { userId })
      .andWhere("goal.start_date <= CURRENT_DATE")
      .andWhere("goal.end_date >= CURRENT_DATE")
      .getMany();
  }

  async getFinishedGoals(userId: number): Promise<Goal[]> {
    return this.goalRepository
      .createQueryBuilder("goal")
      .where("goal.user.id = :userId", { userId })
      .andWhere("goal.end_date < CURRENT_DATE")
      .getMany();
  }
}