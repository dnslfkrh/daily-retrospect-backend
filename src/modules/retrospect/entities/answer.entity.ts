import { Column, Entity, PrimaryGeneratedColumn, ManyToOne, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { RetrospectQuestion } from './question.entity';
import { AnswerType } from 'src/modules/retrospect/enums/retrospect.enum';
import { RetrospectSession } from './session.entity';

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

  @Column({ type: 'varchar', length: 255, nullable: true })
  selected_choice?: string; // 단일 선택형 답변

  @Column({ type: 'simple-array', nullable: true })
  selected_choices?: string[]; // 다중 선택형 답변

  @Column({ type: 'int', nullable: true })
  score?: number; // 점수형 답변 (1~10)

  @Column({ type: 'boolean', default: false })
  skipped: boolean; // 건너뛴 질문 여부

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date; // 답변이 수정될 때마다 자동 갱신
}