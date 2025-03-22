import { Injectable, NotFoundException } from "@nestjs/common";
import { UserSub } from "src/common/types/Payload";
import { RetrospectRepository } from "src/modules/retrospect/repository/retrospect.repository";
import { UserRepository } from "src/modules/user/repository/user.repository";
import { RetrospectSettingDto } from "./dto/setting.dto";
import * as moment from "moment";
import { RetrospectQuestion } from "./entities/question.entity";
import { CONCEPT_RATIOS, RetrospectVolume } from "./enums/retrospect.enum";
import { RetrospectAnswerDto } from "./dto/answer.dto";

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

    const [mainCount, subCount1, subCount2] = CONCEPT_RATIOS[setting.volume as RetrospectVolume];

    const questions: RetrospectQuestion[] = await Promise.all(
      [
        await this.retrospectRepository.findCommonQuestion(),
        ...await this.retrospectRepository.findQuestionsByConcept(concepts[0], mainCount),
        ...await this.retrospectRepository.findQuestionsByConcept(concepts[1], subCount1),
        ...await this.retrospectRepository.findQuestionsByConcept(concepts[2], subCount2),
      ]
    );
    const newSession = await this.retrospectRepository.createSession(userId);
    await this.retrospectRepository.saveSessionQuestions(newSession.id, questions);

    newSession.questions = questions;
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

  async saveAnswer(user: UserSub, sessionId: number, saveAnswerDto: RetrospectAnswerDto) {
    const { questionId, answer } = saveAnswerDto;

    const userId = await this.userRepository.findUserIdByCognitoId(user.sub);
    const session = await this.retrospectRepository.findSessionById(sessionId);

    if (!session || session.user.id !== userId) {
      throw new NotFoundException('No session found');
    }

    return await this.retrospectRepository.saveAnswer(session.id, questionId, answer);
  }
}