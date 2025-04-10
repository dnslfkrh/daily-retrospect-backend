import { Column, CreateDateColumn, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { User } from "../../user/entity/user.entity";
import { RetrospectSession } from "src/modules/retrospect/entities/session.entity";

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
  start_date: string;

  @Column({ type: 'date' })
  end_date: string;

  @OneToMany(() => RetrospectSession, (session) => session.goals)
  retrospect_session: RetrospectSession[];

  @CreateDateColumn()
  created_at: Date;
}
