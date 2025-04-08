import { Injectable } from "@nestjs/common";
import * as moment from "moment";
import { RetrospectSettingDto } from "../dtos/setting.dto";
import { RetrospectQuestion } from "../entities/question.entity";
import { CONCEPT_RATIOS, RetrospectVolume } from "../enums/retrospect.enum";
import { RetrospectQuestionRepository } from "../repositories/question.repository";

@Injectable()
export class RetrospectQuestionService {
  constructor(
    private readonly questionRepository: RetrospectQuestionRepository
  ) {}

  async findGoalQuestion() {
    return await this.questionRepository.findGoalQuestion();
  }

  async selectQuestionsForSession(setting: RetrospectSettingDto, userId: number) {
    const concepts = this.getConceptsBySetting(setting);
    const [mainCount, subCount1, subCount2] = CONCEPT_RATIOS[setting.volume as RetrospectVolume];
    const filterPeriodDays = 3;

    const [candidateQuestionsMain, candidateQuestionsSub1, candidateQuestionsSub2, commonQuestion] = await Promise.all([
      this.questionRepository.findFilteredQuestionsByConcept(concepts[0], filterPeriodDays),
      this.questionRepository.findFilteredQuestionsByConcept(concepts[1], filterPeriodDays),
      this.questionRepository.findFilteredQuestionsByConcept(concepts[2], filterPeriodDays),
      this.questionRepository.findCommonQuestion()
    ]);

    const selectedMain = this.weightedRandomSelect(candidateQuestionsMain, mainCount);
    const selectedSub1 = this.weightedRandomSelect(candidateQuestionsSub1, subCount1);
    const selectedSub2 = this.weightedRandomSelect(candidateQuestionsSub2, subCount2);

    return [
      commonQuestion,
      ...selectedMain,
      ...selectedSub1,
      ...selectedSub2,
    ];
  }

  async updateQuestionsUsage(session, questions: RetrospectQuestion[], userId: number) {
    return await this.questionRepository.updateQuestionsUsage(session, questions, userId);
  }

  private weightedRandomSelect(candidates: RetrospectQuestion[], count: number): RetrospectQuestion[] {
    const selectedQuestions: RetrospectQuestion[] = [];
    if (!candidates || candidates.length === 0) {
      return selectedQuestions;
    }
    const now = moment();

    const weightedCandidates = candidates.map(q => {
      const usageCount = q.usage?.usage_count || 0;
      const lastUsedAt = q.usage?.last_used_at ? moment(q.usage.last_used_at) : moment().subtract(999, 'days');
      const daysSinceUsed = now.diff(lastUsedAt, 'days');
      const weight = daysSinceUsed / (usageCount + 1);
      return { question: q, weight };
    });

    const selectedIndices = new Set<number>();

    for (let i = 0; i < count && selectedIndices.size < weightedCandidates.length; i++) {
      let totalWeight = 0;
      for (let j = 0; j < weightedCandidates.length; j++) {
        if (!selectedIndices.has(j)) {
          totalWeight += weightedCandidates[j].weight;
        }
      }

      const random = Math.random() * totalWeight;
      let cumulative = 0;
      let selectedIndex = -1;

      for (let j = 0; j < weightedCandidates.length; j++) {
        if (selectedIndices.has(j)) continue;

        cumulative += weightedCandidates[j].weight;
        if (random <= cumulative) {
          selectedIndex = j;
          break;
        }
      }

      if (selectedIndex >= 0) {
        selectedIndices.add(selectedIndex);
        selectedQuestions.push(weightedCandidates[selectedIndex].question);
      }
    }

    return selectedQuestions;
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