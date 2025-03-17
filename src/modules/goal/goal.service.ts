import { Injectable } from "@nestjs/common";
import { GoalRepository } from "src/repositories/goal.repository";
import { UserRepository } from "src/repositories/user.repository";

@Injectable()
export class GoalService {
  constructor(
    private readonly goalRepository: GoalRepository,
    private readonly userRepository: UserRepository
  ) { }

  async getActivatedGoals(user) {
    const userId = await this.userRepository.findUserIdByCognitoId(user.sub);
    return await this.goalRepository.getActivatedGoals(userId);
  }

  async getFinishedGoals(user) {
    const userId = await this.userRepository.findUserIdByCognitoId(user.sub);
    return await this.goalRepository.getFinishedGoals(userId);
  }
}