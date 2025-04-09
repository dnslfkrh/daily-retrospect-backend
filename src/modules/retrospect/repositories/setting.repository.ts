import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, UpdateResult } from "typeorm"; // UpdateResult 추가
import { RetrospectSettingDto } from "../dtos/setting.dto";
import { RetrospectSetting } from "../entities/setting.entity";
import { RetrospectConceptEnum } from "../enums/retrospect-concept.enum";
import { RetrospectVolumeEnum } from "../enums/retrospect-volume.enum";
import { User } from "src/modules/user/entity/user.entity"; // Added import

@Injectable()
export class RetrospectSettingRepository {
  constructor(
    @InjectRepository(RetrospectSetting)
    private readonly settingRepository: Repository<RetrospectSetting>
  ) { }

  /**
  * 사용자의 회고 설정 조회, 없으면 서버 지정 기본값 반환
  * @param userId 사용자 ID
  * @returns 사용자의 RetrospectSettingDto
  */
  async findSetting(userId: number): Promise<RetrospectSettingDto> {
    const setting = await this.settingRepository.findOne({
      where: { user: { id: userId } }
    });
    if (!setting) {
      return { concept: RetrospectConceptEnum.EVENT, volume: RetrospectVolumeEnum.STANDARD };
    }
    return {
      concept: setting.concept,
      volume: setting.volume,
    };
  }

  /**
  * 사용자의 회고 설정을 저장하거나 업데이트
  * @param userId 사용자 ID
  * @param settingDto 설정 DTO
  * @returns 저장되거나 업데이트된 RetrospectSetting 엔티티
  */
  async setSetting(userId: number, settingDto: RetrospectSettingDto): Promise<RetrospectSetting> {
    let existingSetting = await this.settingRepository.findOne({
      where: { user: { id: userId } },
      relations: ['user']
    });

    if (existingSetting) {
      await this.settingRepository.update(existingSetting.id, settingDto);
      existingSetting.concept = settingDto.concept;
      existingSetting.volume = settingDto.volume;
      return existingSetting;
    } else {
      const newSetting = this.settingRepository.create({
        ...settingDto,
        user: { id: userId } as User
      });
      return await this.settingRepository.save(newSetting);
    }
  }
}