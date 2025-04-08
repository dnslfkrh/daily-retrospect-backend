import { Injectable } from "@nestjs/common";
import { UserSub } from "src/common/types/Payload";
import { UserRepository } from "src/modules/user/repository/user.repository";
import * as moment from "moment";
import { RetrospectSettingDto } from "../dtos/setting.dto";
import { RetrospectSessionRepository } from "../repositories/session.repository";
import { RetrospectSettingRepository } from "../repositories/setting.repository";

@Injectable()
export class RetrospectSettingService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly settingRepository: RetrospectSettingRepository,
    private readonly sessionRepository: RetrospectSessionRepository
  ) { }

  async getSetting(user: UserSub) {
    const userId = await this.userRepository.findUserIdByCognitoId(user.sub);
    return await this.settingRepository.findSetting(userId);
  }

  async setSetting(user: UserSub, setting: RetrospectSettingDto) {
    const userId = await this.userRepository.findUserIdByCognitoId(user.sub);
    const session = await this.sessionRepository.findSessionByDate(userId, moment().format('YYYY-MM-DD'));
    if (session) {
      await this.sessionRepository.deleteSessionById(session.id);
    }
    return await this.settingRepository.setSetting(userId, setting);
  }
}