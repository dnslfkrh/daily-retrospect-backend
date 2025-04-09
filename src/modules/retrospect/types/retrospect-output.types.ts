import { Goal } from "src/modules/goal/entity/goal.entity";
import { RetrospectQuestion } from "../entities/question.entity";

interface SessionBase {
  answers: {
    question: RetrospectQuestion;
    answer: string | number | undefined | null;
  }[];
}

export interface FormattedSessionOutput extends SessionBase {
  id: number;
  created_at: Date;
  questions: RetrospectQuestion[];
  goals: Goal[];
}

export interface FormattedYesterdaySession extends SessionBase {
  userId: number;
  sessionId: number;
}