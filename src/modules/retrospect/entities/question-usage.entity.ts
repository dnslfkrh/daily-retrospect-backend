import { Entity, PrimaryGeneratedColumn, Column, Index, ManyToOne, Unique } from "typeorm";
import { RetrospectQuestion } from "./question.entity";
import { RetrospectSession } from "./session.entity";
import { User } from "src/modules/user/entity/user.entity";

@Entity('retrospect_question_usage')
@Unique(['user', 'question'])
export class RetrospectQuestionUsage {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  user: User;

  @ManyToOne(() => RetrospectQuestion, { onDelete: 'CASCADE' })
  @Index()
  question: RetrospectQuestion;

  @Column({ type: 'int', default: 0 })
  usage_count: number;

  @Column({ type: 'datetime', nullable: true })
  last_used_at: Date;

  @ManyToOne(() => RetrospectSession, { onDelete: 'CASCADE' })
  session: RetrospectSession;
}
