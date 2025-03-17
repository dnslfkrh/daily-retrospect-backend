import { Injectable } from "@nestjs/common";
import { UserSub } from "src/common/types/Payload";
import { RetrospectRepository } from "src/repositories/retrospect.repository";
import { UserRepository } from "src/repositories/user.repository";

@Injectable()
export class RetrospectService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly retrospectRepository: RetrospectRepository
  ) { }

  async getTodayRetroSpect(user: UserSub) {
    const userId = await this.userRepository.findUserIdByCognitoId(user.sub);
    // TODO: 오늘 해당되는 목표 있는지 확인
    return await this.retrospectRepository.findTodayRetroSpect(userId);
  }

  async createStep1(user: UserSub, mood: string) {
    const userId = await this.userRepository.findUserIdByCognitoId(user.sub);
    return await this.retrospectRepository.createStep1(userId, mood);
  }

  async addStep2(user: UserSub, keywords: string[]) {
    const userId = await this.userRepository.findUserIdByCognitoId(user.sub);
    return await this.retrospectRepository.addStep2(userId, keywords);
  }

  async addStep3(user: UserSub, mistake: string) {
    const userId = await this.userRepository.findUserIdByCognitoId(user.sub);
    return await this.retrospectRepository.addStep3(userId, mistake);
  }

  async addStep4(user: UserSub, achievement: string) {
    const userId = await this.userRepository.findUserIdByCognitoId(user.sub);
    return await this.retrospectRepository.addStep4(userId, achievement);
  }

  async addStep5(user: UserSub, memorable_moment: string) {
    const userId = await this.userRepository.findUserIdByCognitoId(user.sub);
    return await this.retrospectRepository.addStep5(userId, memorable_moment);
  }

  async addStep6(user: UserSub, memorable_interaction: string) {
    const userId = await this.userRepository.findUserIdByCognitoId(user.sub);
    return await this.retrospectRepository.addStep6(userId, memorable_interaction);
  }
}