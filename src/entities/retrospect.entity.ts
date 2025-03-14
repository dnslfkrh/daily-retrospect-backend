import { Column, CreateDateColumn, Entity, Index, ManyToMany, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { User } from "./user.entity";
import { Goal } from "./goal.entity";

@Entity('retrospects')
@Index('user_data_unique', ['user', 'date'], { unique: true }) // 1일 1회고
export class Retrospect {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, (user) => user.retrospects, { onDelete: 'CASCADE' })
  user: User;

  @ManyToOne(() => Goal, (goal) => goal.retrospects, { nullable: true, onDelete: 'SET NULL' })
  goal: Goal;

  @Column({ type: 'date' })
  date: string;

  // 1. 오늘의 기분
  @Column({ type: 'varchar', length: 5 })
  mood: string;

  // 2. 가장 인상깊었던 일
  @Column({ type: 'text', nullable: true })
  highlight: string;

  // 3. 오늘을 표현하는 단어
  @Column({ type: 'simple-array', nullable: true })
  keywords: string[]; // ["", "", ""]

  // 4. 내일의 다짐
  @Column({ type: 'text', nullable: true })
  resolution: string;

  // 5. 오늘의 나에게 한마디
  @Column({ type: 'text', nullable: true })
  comment: string;

  // 목표 관련 질문 (목표가 있는 경우만 값이 들어감)
  @Column({ type: 'enum', enum: ['good', 'normal', 'bad'], nullable: true })
  goal_progress?: 'good' | 'normal' | 'bad';

  @Column({ type: 'text', nullable: true })
  goal_feedback?: string; // 진행 상태에 따라 이유 기록

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}