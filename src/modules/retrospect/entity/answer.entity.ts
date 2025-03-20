import { Column, Entity, PrimaryGeneratedColumn, ManyToOne, CreateDateColumn } from 'typeorm';
import { RetrospectQuestion } from './question.entity';
import { AnswerType } from 'src/common/enums/retrospect.enum';
import { RetrospectSession } from './session.entity';

@Entity('retrospect_answers')
export class RetrospectAnswer {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => RetrospectSession, (session) => session.answers, { onDelete: 'CASCADE' })
  session: RetrospectSession; // 어떤 회고 세션에 속하는지

  @ManyToOne(() => RetrospectQuestion, { nullable: true })
  question: RetrospectQuestion; // 질문 정보

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

  @CreateDateColumn()
  created_at: Date;
}