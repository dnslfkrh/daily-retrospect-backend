import { Column, Entity, Index, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { RetrospectQuestionUsage } from './question-usage.entity';
import { RetrospectConceptEnum } from '../enums/retrospect-concept.enum';
import { RetrospectAnswerTypeEnum } from '../enums/answer-type.enum';

@Entity('retrospect_questions')
export class RetrospectQuestion {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'enum', enum: RetrospectConceptEnum })
  concept: RetrospectConceptEnum; // 감정/사건/성찰 중심

  @Column({ type: 'enum', enum: RetrospectAnswerTypeEnum })
  answer_type: RetrospectAnswerTypeEnum; // text, single_choice, multi_choice, score

  @Column({ type: 'text' })
  question_text: string;

  @Column({ type: 'boolean', default: false })
  @Index()
  is_goal_evaluation: boolean; // 목표 질문인지 확인하는 칼럼

  @OneToOne(() => RetrospectQuestionUsage, usage => usage.question)
  usage: RetrospectQuestionUsage;
}