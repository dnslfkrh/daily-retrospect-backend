import { Column, CreateDateColumn, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { User } from "../../user/entity/user.entity";
import { RetrospectAnswer } from "src/modules/retrospect/entity/answer.entity";

@Entity('goals')
export class Goal {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, (user) => user.goals, { onDelete: 'CASCADE' })
  user: User;

  @Column({ type: 'varchar', length: 255 })
  title: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ type: 'date' })
  start_date: string; // 목표 시작일

  @Column({ type: 'date' })
  end_date: string; // 목표 종료일

  @OneToMany(() => RetrospectAnswer, (answer) => answer.goal)
  retrospectAnswers: RetrospectAnswer[];

  @CreateDateColumn()
  created_at: Date;
}