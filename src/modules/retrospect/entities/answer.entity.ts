import { Column, Entity, PrimaryGeneratedColumn, ManyToOne, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { RetrospectQuestion } from './question.entity';
import { RetrospectSession } from './session.entity';
import { AnswerType } from '../enums/retrospect.enum';

@Entity('retrospect_answers')
export class RetrospectAnswer {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => RetrospectSession, (session) => session.answers, { onDelete: 'CASCADE' })
  session: RetrospectSession;

  @ManyToOne(() => RetrospectQuestion, { nullable: true })
  question: RetrospectQuestion;

  @Column({ type: 'enum', enum: AnswerType })
  answer_type: AnswerType;

  @Column({ type: 'text', nullable: true })
  answer?: string; // 자유 입력형 답변

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date; // 답변이 수정될 때마다 자동 갱신
}