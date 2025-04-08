import { Entity, PrimaryGeneratedColumn, ManyToOne, CreateDateColumn, Column, Unique, OneToMany, ManyToMany, JoinTable } from 'typeorm';
import { User } from 'src/modules/user/entity/user.entity';
import { RetrospectAnswer } from './answer.entity';
import { Goal } from 'src/modules/goal/entity/goal.entity';
import { RetrospectQuestion } from './question.entity';
import { RetrospectQuestionUsage } from './question-usage.entity';

@Entity('retrospect_sessions')
@Unique(['user', 'date']) // 같은 유저가 같은 날짜에 하나만 작성 가능
export class RetrospectSession {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  user: User; // 회고 작성자

  @ManyToMany(() => Goal, { eager: true })
  @JoinTable({ name: 'join_retrospect_sessions_goals' })
  goals: Goal[];

  @ManyToMany(() => RetrospectQuestion, { eager: true })
  @JoinTable({ name: 'join_retrospect_sessions_questions' })
  questions: RetrospectQuestion[];

  @OneToMany(() => RetrospectQuestionUsage, usage => usage.session, { cascade: true })
  questionUsages: RetrospectQuestionUsage[];

  @OneToMany(() => RetrospectAnswer, (answer) => answer.session, { cascade: true })
  answers: RetrospectAnswer[];

  @Column({ type: 'date', nullable: true })
  date: string;

  @CreateDateColumn()
  created_at: Date;
}
