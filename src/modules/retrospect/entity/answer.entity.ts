import { Column, Entity, PrimaryGeneratedColumn, ManyToOne, CreateDateColumn } from 'typeorm';
import { RetrospectSetting } from './setting.entity';
import { RetrospectQuestion } from './question.entity';
import { AnswerType } from 'src/common/enums/retrospect.enum';
import { Goal } from 'src/modules/goal/entitiy/goal.entity';

@Entity('retrospect_answers')
export class RetrospectAnswer {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => RetrospectSetting, (setting) => setting.answers, { onDelete: 'CASCADE' })
  retrospectSetting: RetrospectSetting;

  @ManyToOne(() => RetrospectQuestion, { nullable: true })
  question: RetrospectQuestion;

  @Column({ type: 'enum', enum: AnswerType })
  answer_type: AnswerType; // text, single_choice, multi_choice

  @Column({ type: 'text', nullable: true })
  answer?: string; // 자유 입력형 답변

  @Column({ type: 'varchar', length: 255, nullable: true })
  selected_choice?: string; // 단일 선택형 답변

  @Column({ type: 'simple-array', nullable: true })
  selected_choices?: string[]; // 다중 선택형 답변

  @ManyToOne(() => Goal, { nullable: true, onDelete: 'SET NULL' })
  goal?: Goal; // 특정 목표와 연관된 회고 답변

  @CreateDateColumn()
  created_at: Date;
}
