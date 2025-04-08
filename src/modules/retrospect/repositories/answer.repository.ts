import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { RetrospectAnswer } from "../entities/answer.entity";

@Injectable()
export class RetrospectAnswerRepository {
  constructor(
    @InjectRepository(RetrospectAnswer)
    private readonly answerRepository: Repository<RetrospectAnswer>
  ) {}

  async saveAnswer(sessionId: number, questionId: number, answer: string) {
    const existingAnswer = await this.answerRepository.findOne({
      where: { session: { id: sessionId }, question: { id: questionId } },
      relations: ["session", "question"],
    });
    if (!existingAnswer) {
      const newAnswer = this.answerRepository.create({
        session: { id: sessionId },
        question: { id: questionId },
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

  async findGoalEvaluationAnswers(userId: number, startDate: Date, endDate: Date) {
    return await this.answerRepository
      .createQueryBuilder("answer")
      .innerJoinAndSelect("answer.question", "question")
      .innerJoin("answer.session", "session")
      .where("session.userId = :userId", { userId })
      .andWhere("question.is_goal_evaluation = true")
      .andWhere("answer.created_at BETWEEN :start AND :end", { start: startDate, end: endDate })
      .getMany();
  }
}