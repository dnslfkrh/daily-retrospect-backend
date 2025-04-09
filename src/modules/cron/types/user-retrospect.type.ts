export interface UserRetrospectProps {
  userId: number;
  sessionId: number;
  answers: {
    question: string;
    answer: string;
  }[];
}
