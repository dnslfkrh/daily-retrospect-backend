import { Entity, PrimaryGeneratedColumn, ManyToOne, CreateDateColumn, Column, Unique, OneToMany, ManyToMany, JoinTable } from 'typeorm';
import { User } from 'src/modules/user/entity/user.entity';
import { RetrospectAnswer } from './answer.entity';
import { Goal } from 'src/modules/goal/entity/goal.entity';
import { RetrospectQuestion } from './question.entity';
import { RetrospectQuestionUsage } from './question-usage.entity';

@Entity('retrospect_sessions')
@Unique(['user', 'date'])
export class RetrospectSession {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  user: User;

  @ManyToMany(() => Goal, { eager: true })
  @JoinTable({ name: 'join_retrospect_sessions_goals' })
  goals: Goal[];

  @ManyToMany(() => RetrospectQuestion, { eager: true })
  @JoinTable({ name: 'join_retrospect_sessions_questions' })
  questions: RetrospectQuestion[];

  @OneToMany(() => RetrospectQuestionUsage, usage => usage.session, { cascade: true })
  question_usage: RetrospectQuestionUsage[];

  @OneToMany(() => RetrospectAnswer, (answer) => answer.session, { cascade: true })
  answers: RetrospectAnswer[];

  @Column({ type: 'date', nullable: true })
  date: string;

  @CreateDateColumn()
  created_at: Date;
}
