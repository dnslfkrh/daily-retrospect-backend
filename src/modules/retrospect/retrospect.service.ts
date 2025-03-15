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
    return await this.retrospectRepository.findTodayRetroSpect(userId);
  }

  async createStep1(user: UserSub, mood: string) {
    const userId = await this.userRepository.findUserIdByCognitoId(user.sub);
    return await this.retrospectRepository.createStep1(userId, mood);
  }

  async addStep2(user: UserSub, highlight: string) {
    const userId = await this.userRepository.findUserIdByCognitoId(user.sub);
    return await this.retrospectRepository.addStep2(userId, highlight);
  }

  async addStep3(user: UserSub, keywords: string[]) {
    const userId = await this.userRepository.findUserIdByCognitoId(user.sub);
    return await this.retrospectRepository.addStep3(userId, keywords);
  }

  async addStep4(user: UserSub, resolution: string) {
    const userId = await this.userRepository.findUserIdByCognitoId(user.sub);
    return await this.retrospectRepository.addStep4(userId, resolution);
  }

  async addStep5(user: UserSub, commnet: string) {
    const userId = await this.userRepository.findUserIdByCognitoId(user.sub);
    return await this.retrospectRepository.addStep5(userId, commnet);
  }
}