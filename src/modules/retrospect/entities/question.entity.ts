import { AnswerType, RetrospectConcept } from 'src/modules/retrospect/enums/retrospect.enum';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('retrospect_questions')
export class RetrospectQuestion {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'enum', enum: RetrospectConcept })
  concept: RetrospectConcept; // 감정/사건/성찰 중심

  @Column({ type: 'enum', enum: AnswerType })
  answer_type: AnswerType; // text, single_choice, multi_choice, score

  @Column({ type: 'text' })
  question_text: string;
}
