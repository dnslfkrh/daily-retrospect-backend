import { Injectable } from "@nestjs/common";
import * as moment from "moment";
import { RetrospectSettingDto } from "../dtos/setting.dto";
import { RetrospectQuestion } from "../entities/question.entity";
import { RetrospectQuestionRepository } from "../repositories/question.repository";
import { RetrospectConceptEnum } from "../enums/retrospect-concept.enum";
import { RetrospectSession } from "../entities/session.entity";
import { CONCEPT_RATIOS } from "../constant/retrospect.constant";

@Injectable()
export class RetrospectQuestionService {
  constructor(
    private readonly questionRepository: RetrospectQuestionRepository
  ) { }

  /**
  * 목표 관련 질문 조회
  * @returns 조회된 RetrospectQuestion 또는 undefined
  */
  async findGoalQuestion(): Promise<RetrospectQuestion | undefined> {
    return await this.questionRepository.findGoalQuestion();
  }

  /**
  * 사용자 설정과 최근 사용 내역을 바탕으로 회고 세션에 사용할 질문 목록 선택
  * @param setting 사용자 회고 설정
  * @param userId 사용자 ID
  * @returns 선택된 질문 목록 (첫번째는 공통 질문, 나머지는 가중치 랜덤 선택된 질문)
  */
  async selectQuestionsForSession(setting: RetrospectSettingDto, userId: number): Promise<(RetrospectQuestion | undefined)[]> {
    const concepts = this.getConceptsBySetting(setting);
    const [mainCount, subCount1, subCount2] = (CONCEPT_RATIOS)[setting.volume] || [4, 1, 1];

    const filterPeriodDays = 3; // 3일 전부터 사용된 질문 제외

    const [candidateQuestionsMain, candidateQuestionsSub1, candidateQuestionsSub2, commonQuestion] = await Promise.all([
      this.questionRepository.findFilteredQuestionsByConcept(concepts[0], filterPeriodDays),
      this.questionRepository.findFilteredQuestionsByConcept(concepts[1], filterPeriodDays),
      this.questionRepository.findFilteredQuestionsByConcept(concepts[2], filterPeriodDays),
      this.questionRepository.findCommonQuestion()
    ]);

    const selectedMain = this.weightedRandomSelect(candidateQuestionsMain, mainCount);
    const selectedSub1 = this.weightedRandomSelect(candidateQuestionsSub1, subCount1);
    const selectedSub2 = this.weightedRandomSelect(candidateQuestionsSub2, subCount2);

    const finalQuestions = [
      commonQuestion,
      ...selectedMain,
      ...selectedSub1,
      ...selectedSub2,
    ];
    return finalQuestions;
  }

  /**
  * 질문 사용 내역 업데이트
  * @param session 현재 회고 세션
  * @param questions 사용된 질문 목록
  * @param userId 사용자 ID
  */
  async updateQuestionsUsage(session: RetrospectSession, questions: RetrospectQuestion[], userId: number): Promise<void> {
    const validQuestions = questions.filter((q): q is RetrospectQuestion => q !== undefined);
    if (validQuestions.length > 0) {
      await this.questionRepository.updateQuestionsUsage(session, validQuestions, userId);
    }
  }

  /**
  * 후보 질문 목록에서 가중치 기반 랜덤 선택
  * (최근 사용되지 않았고, 사용 횟수가 적을수록 높은 가중치)
  * @param candidates 후보 질문 배열
  * @param count 선택할 질문 개수
  * @returns 선택된 질문 배열
  */
  private weightedRandomSelect(candidates: RetrospectQuestion[], count: number): RetrospectQuestion[] {
    const selectedQuestions: RetrospectQuestion[] = [];
    if (!candidates || candidates.length === 0 || count <= 0) {
      return selectedQuestions;
    }
    const now = moment();

    const weightedCandidates = candidates.map(q => {
      const usageCount = q.usage?.usage_count || 0;
      const daysSinceUsed = q.usage?.last_used_at
        ? now.diff(moment(q.usage.last_used_at), 'days')
        : Number.MAX_SAFE_INTEGER;
      const weight = daysSinceUsed / (usageCount + 1) + 0.001;
      return { question: q, weight };
    }).filter(wc => wc.weight > 0);

    if (weightedCandidates.length === 0) {
      return [];
    }

    const selectedIndices = new Set<number>();

    for (let i = 0; i < count && selectedIndices.size < weightedCandidates.length; i++) {
      let totalWeight = 0;
      for (let j = 0; j < weightedCandidates.length; j++) {
        if (!selectedIndices.has(j)) {
          totalWeight += weightedCandidates[j].weight;
        }
      }

      if (totalWeight <= 0) break;

      const random = Math.random() * totalWeight;
      let cumulativeWeight = 0;
      let selectedIndex = -1;

      for (let j = 0; j < weightedCandidates.length; j++) {
        if (selectedIndices.has(j)) {
          continue;
        }

        cumulativeWeight += weightedCandidates[j].weight;
        if (random <= cumulativeWeight) {
          selectedIndex = j;
          break;
        }
      }

      if (selectedIndex !== -1 && !selectedIndices.has(selectedIndex)) {
        selectedIndices.add(selectedIndex);
        selectedQuestions.push(weightedCandidates[selectedIndex].question);
      } else if (selectedIndex === -1 && selectedIndices.size < weightedCandidates.length) {
        for (let j = 0; j < weightedCandidates.length; j++) {
          if (!selectedIndices.has(j)) {
            selectedIndices.add(j);
            selectedQuestions.push(weightedCandidates[j].question);
            break;
          }
        }
      }
    }

    return selectedQuestions;
  }

  /**
  * 사용자 설정에 따른 주요/보조 개념 순서를 반환합니다.
  * @param setting 사용자 회고 설정
  * @returns 개념(Concept) 배열
  */
  private getConceptsBySetting(setting: RetrospectSettingDto): RetrospectConceptEnum[] {
    const conceptWeights: Record<RetrospectConceptEnum, RetrospectConceptEnum[]> = {
      [RetrospectConceptEnum.EMOTION]: [RetrospectConceptEnum.EMOTION, RetrospectConceptEnum.EVENT, RetrospectConceptEnum.REFLECTION],
      [RetrospectConceptEnum.EVENT]: [RetrospectConceptEnum.EVENT, RetrospectConceptEnum.EMOTION, RetrospectConceptEnum.REFLECTION],
      [RetrospectConceptEnum.REFLECTION]: [RetrospectConceptEnum.REFLECTION, RetrospectConceptEnum.EVENT, RetrospectConceptEnum.EMOTION],
      [RetrospectConceptEnum.GOAL]: [],
      [RetrospectConceptEnum.COMMON]: [],
    };
    return conceptWeights[setting.concept] || [RetrospectConceptEnum.EVENT, RetrospectConceptEnum.EMOTION, RetrospectConceptEnum.REFLECTION];
  }
}