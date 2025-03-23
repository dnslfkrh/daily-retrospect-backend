import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { Goal } from '../../goal/entity/goal.entity';
import { RetrospectSetting } from 'src/modules/retrospect/entities/setting.entity';

@Entity('users')
@Index('cognito_id_unique', ['cognito_id'], { unique: true })
@Index('email_unique', ['email'], { unique: true })
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255, unique: true })
  email: string;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  cognito_id: string;

  @CreateDateColumn()
  created_at: Date;

  @OneToMany(() => RetrospectSetting, (setting) => setting.user, { cascade: true })
  retrospectSettings: RetrospectSetting[];

  @OneToMany(() => Goal, (goal) => goal.user, { cascade: true })
  goals: Goal[];
}