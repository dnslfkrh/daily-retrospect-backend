import { Injectable } from "@nestjs/common";
import { UserSub } from "src/common/types/user-payload.type";
import { GoalRepository } from "src/modules/goal/repository/goal.repository";
import { UserRepository } from "src/modules/user/repository/user.repository";
import { CreateGoalDto, UpdateGoalDto } from "./dto/goal.dto";
import * as moment from "moment";

@Injectable()
export class GoalService {
  constructor(
    private readonly goalRepository: GoalRepository,
    private readonly userRepository: UserRepository
  ) { }

  async getActivatedGoals(user: UserSub) {
    const userId = await this.userRepository.findUserIdByCognitoId(user.sub);
    return await this.goalRepository.getActivatedGoals(userId);
  }

  async getFinishedGoals(user: UserSub) {
    const userId = await this.userRepository.findUserIdByCognitoId(user.sub);
    return await this.goalRepository.getFinishedGoals(userId);
  }

  async createGoal(user: UserSub, createGoalDto: CreateGoalDto) {
    const userId = await this.userRepository.findUserIdByCognitoId(user.sub);
    return await this.goalRepository.createGoal(userId, createGoalDto);
  }

  async updateGoal(user: UserSub, updateGoalDto: UpdateGoalDto) {
    const userId = await this.userRepository.findUserIdByCognitoId(user.sub);
    return await this.goalRepository.updateGoal(userId, updateGoalDto);
  }

  async deleteGoal(user: UserSub, id: number) {
    const userId = await this.userRepository.findUserIdByCognitoId(user.sub);
    return await this.goalRepository.deleteGoal(userId, id);
  }

  async getActiveGoals(userId: number, date: string) {
    return await this.goalRepository.findActiveGoals(userId, date);
  }
}