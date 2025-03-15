import { Column, CreateDateColumn, Entity, Index, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { User } from "./user.entity";
import { Goal } from "./goal.entity";
import { MoodType } from "src/common/enums/mood.enum";

@Entity('retrospects')
@Index('user_date_unique', ['user', 'date'], { unique: true }) // 1일 1회고
export class Retrospect {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, (user) => user.retrospects, { onDelete: 'CASCADE' })
  user: User;

  @ManyToOne(() => Goal, (goal) => goal.retrospects, { nullable: true, onDelete: 'SET NULL' })
  goal: Goal;

  @Column({ type: 'date' })
  date: string;

  // 1. 오늘 나의 기분은?
  @Column({ type: 'enum', enum: MoodType })
  mood: string;

  // 2. 오늘을 표현할 수 있는 키워드는?
  @Column({ type: 'simple-array', nullable: true })
  keywords: string[]; // ["", "", ""]

  // 3. 오늘 나의 실수는?
  @Column({ type: 'text', nullable: true })
  mistake: string;

  // 4. 오늘 나의 성취는?
  @Column({ type: 'text', nullable: true })
  achievement: string;

  // 5. 오늘 가장 기억에 남는 순간은?
  @Column({ type: 'text', nullable: true })
  memorable_moment: string;

  // 6. 오늘 만난 사람이나 인상 깊었던 대화는?
  @Column({ type: 'text', nullable: true })
  memorable_interaction: string;

  // 목표 관련 질문 (해당 날짜에 목표가 있는 경우만 질문+응답)
  @Column({ type: 'integer', nullable: true })
  goal_rating?: number; // 1-5 점수로 진행도 평가

  @CreateDateColumn()
  created_at: Date;
}