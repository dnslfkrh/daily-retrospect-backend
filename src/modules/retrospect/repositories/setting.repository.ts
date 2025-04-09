import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { RetrospectSettingDto } from "../dtos/setting.dto";
import { RetrospectSetting } from "../entities/setting.entity";
import { RetrospectConceptEnum } from "../enums/retrospect-concept.enum";
import { RetrospectVolumeEnum } from "../enums/retrospect-volume.enum";

@Injectable()
export class RetrospectSettingRepository {
  constructor(
    @InjectRepository(RetrospectSetting)
    private readonly settingRepository: Repository<RetrospectSetting>
  ) { }

  async findSetting(userId: number): Promise<RetrospectSettingDto> {
    const setting = await this.settingRepository.findOne({ where: { user: { id: userId } } });
    if (!setting) {
      return { concept: RetrospectConceptEnum.EVENT, volume: RetrospectVolumeEnum.STANDARD };
    }
    return {
      concept: setting.concept,
      volume: setting.volume,
    };
  }

  async setSetting(userId: number, settingDto: RetrospectSettingDto) {
    let existingSetting = await this.settingRepository.findOne({ where: { user: { id: userId } } });
    if (existingSetting) {
      await this.settingRepository.update(existingSetting.id, settingDto);
    } else {
      existingSetting = this.settingRepository.create({ ...settingDto, user: { id: userId } });
      await this.settingRepository.save(existingSetting);
    }
    return existingSetting;
  }
}