import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import * as moment from "moment";
import { RetrospectQuestion } from "../entities/question.entity";
import { RetrospectSetting } from "../entities/setting.entity";
import { RetrospectAnswer } from "../entities/answer.entity";
import { RetrospectSession } from "../entities/session.entity";
import { RetrospectSettingDto } from "../dto/setting.dto";

@Injectable()
export class RetrospectRepository {
  constructor(
    @InjectRepository(RetrospectSetting)
    private readonly settingRepository: Repository<RetrospectSetting>,
    @InjectRepository(RetrospectSession)
    private readonly sessionRepository: Repository<RetrospectSession>,
    @InjectRepository(RetrospectQuestion)
    private readonly questionRepository: Repository<RetrospectQuestion>,
    @InjectRepository(RetrospectAnswer)
    private readonly answerRepository: Repository<RetrospectAnswer>
  ) { }

  async getSetting(userId: number) {
    const user = { id: userId };
    return await this.settingRepository.findOne({
      where: { user },
    });
  }

  async setSetting(userId: number, settingDto: RetrospectSettingDto) {
    const user = { id: userId };
    const existSetting = await this.settingRepository.findOne({ where: { user } });

    if (existSetting) {
      await this.settingRepository.update({ user }, settingDto);
      return await this.settingRepository.findOne({ where: { user } });
    }

    return await this.settingRepository.save({ ...settingDto, user });
  }
}
