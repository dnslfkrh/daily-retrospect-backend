import { Column, Entity, PrimaryGeneratedColumn, ManyToOne, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { RetrospectQuestion } from './question.entity';
import { RetrospectSession } from './session.entity';

@Entity('retrospect_answers')
export class RetrospectAnswer {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => RetrospectSession, (session) => session.answers, { onDelete: 'CASCADE' })
  session: RetrospectSession;

  @ManyToOne(() => RetrospectQuestion, { nullable: true })
  question: RetrospectQuestion;

  @Column({ type: 'text', nullable: true })
  answer?: string | number | string[] | number[];

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
