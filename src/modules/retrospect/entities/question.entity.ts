import { AnswerType, RetrospectConcept } from 'src/modules/retrospect/enums/retrospect.enum';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('retrospect_questions')
export class RetrospectQuestion {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'enum', enum: RetrospectConcept })
  concept: RetrospectConcept; // 감정/사건/성찰 중심

  // 답변 타입을 알려줘서 클라이언트 측에서 어떤 형식으로 답변을 받아야 하는지 알 수 있게 함
  @Column({ type: 'enum', enum: AnswerType })
  answer_type: AnswerType; // text, single_choice, multi_choice, score

  @Column({ type: 'text' })
  question_text: string;
}
