import { Injectable, NotFoundException } from "@nestjs/common";
import { UserSub } from "src/common/types/Payload";
import { RetrospectRepository } from "src/modules/retrospect/repository/retrospect.repository";
import { UserRepository } from "src/modules/user/repository/user.repository";
import { RetrospectSettingDto } from "./dto/setting.dto";
import * as moment from "moment";
import { RetrospectQuestion } from "./entities/question.entity";
import { CONCEPT_RATIOS, RetrospectVolume } from "./enums/retrospect.enum";

@Injectable()
export class RetrospectService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly retrospectRepository: RetrospectRepository
  ) { }

  async getSetting(user: UserSub) {
    const userId = await this.userRepository.findUserIdByCognitoId(user.sub);
    return await this.retrospectRepository.findSetting(userId);
  }

  async setSetting(user: UserSub, setting: RetrospectSettingDto) {
    const userId = await this.userRepository.findUserIdByCognitoId(user.sub);
    return await this.retrospectRepository.setSetting(userId, setting);
  }

  async findOrCreateSession(user: UserSub) {
    const userId = await this.userRepository.findUserIdByCognitoId(user.sub);
    let session = await this.retrospectRepository.findSessionByDate(userId, moment().format('YYYY-MM-DD'));

    if (!session) {
      session = await this.createSessionWithQuestions(userId);
    }

    console.log(session);

    return session;
  }

  private async createSessionWithQuestions(userId: number) {
    const setting = await this.retrospectRepository.findSetting(userId);
    const concepts = this.getConceptsBySetting(setting);
    const questionList: RetrospectQuestion[] = [];

    const commonQuestion = await this.retrospectRepository.findCommonQuestion();
    if (commonQuestion) {
      questionList.push(commonQuestion);
    }

    const [mainCount, subCount1, subCount2] = CONCEPT_RATIOS[setting.volume as RetrospectVolume];

    questionList.push(...await this.retrospectRepository.findQuestionsByConcept(concepts[0], mainCount));
    questionList.push(...await this.retrospectRepository.findQuestionsByConcept(concepts[1], subCount1));
    questionList.push(...await this.retrospectRepository.findQuestionsByConcept(concepts[2], subCount2));

    const newSession = await this.retrospectRepository.createSession(userId);
    await this.retrospectRepository.saveSessionQuestions(newSession.id, questionList);

    newSession.questions = questionList;
    return newSession;
  }

  private getConceptsBySetting(setting: RetrospectSettingDto) {
    const conceptWeights = {
      'emotion': ['emotion', 'event', 'reflection'],
      'event': ['event', 'emotion', 'reflection'],
      'reflection': ['reflection', 'event', 'emotion'],
    };
    return conceptWeights[setting.concept] || [];
  }
}