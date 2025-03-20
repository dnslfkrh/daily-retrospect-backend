import { Column, Entity, PrimaryGeneratedColumn, OneToMany, ManyToOne } from 'typeorm';
import { RetrospectConcept, RetrospectVolume } from 'src/common/enums/retrospect.enum';
import { RetrospectAnswer } from './answer.entity';
import { User } from 'src/modules/user/entity/user.entity';

@Entity('retrospect_settings')
export class RetrospectSetting {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, (user) => user.retrospectSettings, { onDelete: 'CASCADE' })
  user: User;

  @Column({ type: 'enum', enum: RetrospectConcept })
  concept: RetrospectConcept; // 감정, 사건, 성찰

  @Column({ type: 'enum', enum: RetrospectVolume })
  volume: RetrospectVolume; // 4, 5, 6개 질문 설정

  @OneToMany(() => RetrospectAnswer, (answer) => answer.retrospectSetting)
  answers: RetrospectAnswer[];
}
