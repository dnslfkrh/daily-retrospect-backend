import { Entity, PrimaryGeneratedColumn, ManyToOne, CreateDateColumn, OneToMany, ManyToMany, JoinTable } from 'typeorm';
import { User } from 'src/modules/user/entity/user.entity';
import { RetrospectAnswer } from './answer.entity';
import { Goal } from 'src/modules/goal/entity/goal.entity';
import { RetrospectQuestion } from './question.entity';

@Entity('retrospect_sessions')
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

  @OneToMany(() => RetrospectAnswer, (answer) => answer.session, { cascade: true })
  answers: RetrospectAnswer[];

  @CreateDateColumn()
  created_at: Date; // 회고 작성 날짜
}
