import { Injectable } from "@nestjs/common";
import { UserSub } from "src/common/types/Payload";
import { RetrospectRepository } from "src/modules/retrospect/repository/retrospect.repository";
import { UserRepository } from "src/modules/user/repository/user.repository";
import { RetrospectSettingDto } from "./dto/setting.dto";

@Injectable()
export class RetrospectService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly retrospectRepository: RetrospectRepository
  ) { }

  async getSetting(user: UserSub) {
    const userId = await this.userRepository.findUserIdByCognitoId(user.sub);
    return await this.retrospectRepository.getSetting(userId);
  }

  async setSetting(user: UserSub, setting: RetrospectSettingDto) {
    const userId = await this.userRepository.findUserIdByCognitoId(user.sub);
    return await this.retrospectRepository.setSetting(userId, setting);
  }
}