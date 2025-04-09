import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { RetrospectAnswer } from "../entities/answer.entity";
import { RetrospectSession } from "../entities/session.entity";
import { RetrospectQuestion } from "../entities/question.entity";

@Injectable()
export class RetrospectAnswerRepository {
  constructor(
    @InjectRepository(RetrospectAnswer)
    private readonly answerRepository: Repository<RetrospectAnswer>
  ) { }

  /**
  * 답변을 추가하거나 수정
  * @param sessionId 세션 ID
  * @param questionId 질문 ID
  * @param answer 답변 내용
  * @returns 저장되거나 업데이트된 RetrospectAnswer 엔티티
  */
  async saveAnswer(sessionId: number, questionId: number, answer: string): Promise<RetrospectAnswer> {
    const existingAnswer = await this.answerRepository.findOne({
      where: { session: { id: sessionId }, question: { id: questionId } },
      relations: ["session", "question"],
    });

    if (!existingAnswer) {
      const newAnswer = this.answerRepository.create({
        session: { id: sessionId } as RetrospectSession,
        question: { id: questionId } as RetrospectQuestion,
        answer,
      });
      return await this.answerRepository.save(newAnswer);
    }

    if (existingAnswer.answer !== answer) {
      existingAnswer.answer = answer;
      return await this.answerRepository.save(existingAnswer);
    }

    return existingAnswer;
  }

  /**
  * 특정 기간 동안의 사용자의 목표 평가 질문에 대한 답변들 조회
  * @param userId 사용자 ID
  * @param startDate 조회 시작일
  * @param endDate 조회 종료일
  * @returns 목표 평가 질문에 대한 RetrospectAnswer 배열
  */
  async findGoalEvaluationAnswers(userId: number, startDate: Date, endDate: Date): Promise<RetrospectAnswer[]> {
    return await this.answerRepository
      .createQueryBuilder("answer")
      .innerJoinAndSelect("answer.question", "question")
      .innerJoin("answer.session", "session")
      .where("session.user.id = :userId", { userId })
      .andWhere("question.is_goal_evaluation = true")
      .andWhere("answer.created_at BETWEEN :start AND :end", { start: startDate, end: endDate })
      .getMany();
  }
}