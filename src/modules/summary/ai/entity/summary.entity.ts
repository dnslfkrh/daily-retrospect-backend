import { RetrospectSession } from 'src/modules/retrospect/entities/session.entity';
import { User } from 'src/modules/user/entity/user.entity';
import { Entity, PrimaryGeneratedColumn, Column, BaseEntity, ManyToOne, CreateDateColumn } from 'typeorm';

@Entity('retrospect_summary')
export class RetrospectSummary {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  user: User;

  @ManyToOne(() => RetrospectSession, { onDelete: 'CASCADE' })
  session: RetrospectSession;

  @Column('text')
  summary: string;

  @CreateDateColumn()
  createdAt: Date;
}
