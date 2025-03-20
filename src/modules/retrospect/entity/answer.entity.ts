import { Column, Entity, PrimaryGeneratedColumn, ManyToOne, CreateDateColumn } from 'typeorm';
import { RetrospectQuestion } from './question.entity';
import { AnswerType } from 'src/common/enums/retrospect.enum';
import { Goal } from 'src/modules/goal/entitiy/goal.entity';

@Entity('retrospect_answers')
export class RetrospectAnswer {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => RetrospectQuestion, { nullable: true })
  question: RetrospectQuestion;

  @Column({ type: 'enum', enum: AnswerType })
  answer_type: AnswerType;

  @Column({ type: 'text', nullable: true })
  answer?: string; // 자유 입력형 답변

  @Column({ type: 'varchar', length: 255, nullable: true })
  selected_choice?: string; // 단일 선택형 답변

  @Column({ type: 'simple-array', nullable: true })
  selected_choices?: string[]; // 다중 선택형 답변

  @Column({ type: 'int', nullable: true })
  score?: number; // 점수형 답변 (1~10)

  @ManyToOne(() => Goal, { nullable: true, onDelete: 'SET NULL' })
  goal?: Goal; // 특정 목표와 연관된 회고 답변

  @CreateDateColumn()
  created_at: Date;
}