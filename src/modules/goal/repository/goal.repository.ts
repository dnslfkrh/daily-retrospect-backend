import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { CreateGoalDto, UpdateGoalDto } from "src/modules/goal/dto/goal.dto";
import { Repository } from "typeorm";
import { Goal } from "../entity/goal.entity";
import * as moment from 'moment';

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
      .andWhere("CURRENT_DATE <= goal.end_date")
      .getMany();
  }

  async getFinishedGoals(userId: number): Promise<Goal[]> | null {
    return this.goalRepository
      .createQueryBuilder("goal")
      .where("goal.user.id = :userId", { userId })
      .andWhere("CURRENT_DATE > goal.end_date")
      .getMany();
  }

  async createGoal(userId: number, createGoalDto: CreateGoalDto): Promise<Goal> {
    const newGoal = this.goalRepository.create({
      ...createGoalDto,
      user: { id: userId }
    });

    return await this.goalRepository.save(newGoal);
  }

  async updateGoal(userId: number, updateGoalDto: UpdateGoalDto): Promise<Goal> {
    const goal = await this.goalRepository.findOne({
      where: { id: updateGoalDto.id, user: { id: userId } }
    });

    if (!goal) {
      throw new NotFoundException("해당 목표를 찾을 수 없습니다.");
    }

    return await this.goalRepository.save({
      ...goal,
      ...updateGoalDto
    });
  }

  async deleteGoal(userId: number, id: number): Promise<Goal> {
    const goal = await this.goalRepository.findOne({
      where: { id, user: { id: userId } }
    });

    if (!goal) {
      throw new NotFoundException("해당 목표를 찾을 수 없습니다.");
    }

    return await this.goalRepository.remove(goal);
  }

  async findActiveGoals(userId: number, targetDate: string): Promise<Goal[]> {
    const date = targetDate ? moment(targetDate).startOf('day') : moment().startOf('day');
    
    return this.goalRepository
      .createQueryBuilder("goal")
      .where("goal.user.id = :userId", { userId })
      .andWhere("goal.start_date <= :date", { date: date.toISOString() })
      .andWhere("goal.end_date >= :date", { date: date.toISOString() })
      .getMany();
  }
}