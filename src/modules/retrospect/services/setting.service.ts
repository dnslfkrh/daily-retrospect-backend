import { Injectable } from "@nestjs/common";
import { UserSub } from "src/common/types/user-payload.type";
import { UserRepository } from "src/modules/user/repository/user.repository";
import * as moment from "moment";
import { RetrospectSettingDto } from "../dtos/setting.dto";
import { RetrospectSessionRepository } from "../repositories/session.repository";
import { RetrospectSettingRepository } from "../repositories/setting.repository";
import { RetrospectSetting } from "../entities/setting.entity";

@Injectable()
export class RetrospectSettingService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly settingRepository: RetrospectSettingRepository,
    private readonly sessionRepository: RetrospectSessionRepository
  ) { }

  /**
  * 사용자의 현재 회고 설정 조회
  * @param user 사용자 정보
  * @returns 회고 설정 DTO (RetrospectSettingDto)
  */
  async getSetting(user: UserSub): Promise<RetrospectSettingDto> {
    const userId = await this.userRepository.findUserIdByCognitoId(user.sub);
    return await this.settingRepository.findSetting(userId);
  }

  /**
  * 사용자의 회고 설정 업데이트
  * 설정 변경 시 오늘 작성 중이던 세션이 있으면 삭제
  * @param user 사용자 정보
  * @param setting 새로운 설정 DTO
  * @returns 저장된 회고 설정 엔티티 (RetrospectSetting)
  */
  async setSetting(user: UserSub, setting: RetrospectSettingDto): Promise<RetrospectSetting> {
    const userId = await this.userRepository.findUserIdByCognitoId(user.sub);

    const today = moment().format('YYYY-MM-DD');
    const session = await this.sessionRepository.findSessionByDate(userId, today);

    if (session) {
      await this.sessionRepository.deleteSessionById(session.id);
    }

    return await this.settingRepository.setSetting(userId, setting);
  }
}