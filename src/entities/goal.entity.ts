import { Column, CreateDateColumn, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { User } from "./user.entity";
import { Retrospect } from "./retrospect.entity";

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

  @Column({ type: 'boolean', default: false })
  completed: boolean;

  @OneToMany(() => Retrospect, (retrospect) => retrospect.goal)
  retrospects: Retrospect[];

  @CreateDateColumn()
  created_at: Date;
}