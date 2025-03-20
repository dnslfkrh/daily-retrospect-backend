import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import * as moment from "moment";
import { RetrospectQuestion } from "../entity/question.entity";
import { RetrospectSetting } from "../entity/setting.entity";
import { RetrospectAnswer } from "../entity/answer.entity";

@Injectable()
export class RetrospectRepository {
  constructor(
    @InjectRepository(RetrospectSetting)
    private readonly retrospectSettingRepository: Repository<RetrospectSetting>,
    @InjectRepository(RetrospectQuestion)
    private readonly retrospectQuestionRepository: Repository<RetrospectQuestion>,
    @InjectRepository(RetrospectAnswer)
    private readonly retrospectAnswerRepository: Repository<RetrospectAnswer>
  ) { }
}
