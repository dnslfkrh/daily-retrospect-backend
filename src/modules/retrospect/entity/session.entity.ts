import { Column, Entity, PrimaryGeneratedColumn, ManyToOne, CreateDateColumn, OneToMany } from 'typeorm';
import { User } from 'src/modules/user/entity/user.entity';
import { RetrospectAnswer } from './answer.entity';
import { Goal } from 'src/modules/goal/entitiy/goal.entity';

@Entity('retrospect_sessions')
export class RetrospectSession {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  user: User; // 회고 작성자

  @ManyToOne(() => Goal, (goal) => goal.retrospectSessions, { nullable: true, onDelete: 'SET NULL' })
  goal?: Goal; // 특정 목표와 연결된 회고 (없을 수도 있음)

  @OneToMany(() => RetrospectAnswer, (answer) => answer.session)
  answers: RetrospectAnswer[]; // 해당 회고에 대한 답변들

  @CreateDateColumn()
  created_at: Date; // 회고 작성 날짜
}
