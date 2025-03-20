import { RetrospectConcept } from 'src/common/enums/retrospect.enum';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('retrospect_questions')
export class RetrospectQuestion {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'enum', enum: RetrospectConcept })
  concept: RetrospectConcept; // 질문의 컨셉 (감정/사건/성찰)

  @Column({ type: 'text' })
  question_text: string;
}
