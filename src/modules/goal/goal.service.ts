import { Injectable } from "@nestjs/common";
import { UserSub } from "src/common/types/Payload";
import { GoalRepository } from "src/repositories/goal.repository";
import { UserRepository } from "src/repositories/user.repository";
import { CreateGoalDto, UpdateGoalDto } from "./\bdto/goal.dto";

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
}