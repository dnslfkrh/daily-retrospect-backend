import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToOne, JoinColumn, Index, ManyToOne, Unique } from "typeorm";
import { RetrospectQuestion } from "./question.entity";
import { RetrospectSession } from "./session.entity";
import { User } from "src/modules/user/entity/user.entity";

@Entity('retrospect_question_usage')
@Unique(['user', 'question']) // 사용자-질문 조합은 유일해야 함
export class RetrospectQuestionUsage {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  // 질문 ID를 인덱스로 관리하여 조회 성능 개선
  @ManyToOne(() => RetrospectQuestion, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'question_id' })
  @Index()
  question: RetrospectQuestion;

  @Column({ type: 'int', default: 0 })
  usage_count: number; // 질문이 사용된 총 횟수

  @Column({ type: 'datetime', nullable: true })
  last_used_at: Date; // 마지막 사용 시각

  @ManyToOne(() => RetrospectSession, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'session_id' })
  session: RetrospectSession;
}
