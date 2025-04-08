import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { RetrospectConcept, RetrospectVolume } from "../enums/retrospect.enum";
import { RetrospectSettingDto } from "../dtos/setting.dto";
import { RetrospectSetting } from "../entities/setting.entity";

@Injectable()
export class RetrospectSettingRepository {
  constructor(
    @InjectRepository(RetrospectSetting)
    private readonly settingRepository: Repository<RetrospectSetting>
  ) {}

  async findSetting(userId: number): Promise<RetrospectSettingDto> {
    const setting = await this.settingRepository.findOne({ where: { user: { id: userId } } });
    if (!setting) {
      return { concept: RetrospectConcept.EVENT, volume: RetrospectVolume.STANDARD };
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