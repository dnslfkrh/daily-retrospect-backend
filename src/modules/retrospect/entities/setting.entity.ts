import { Column, Entity, PrimaryGeneratedColumn, OneToMany, ManyToOne } from 'typeorm';
import { RetrospectConcept, RetrospectVolume } from 'src/modules/retrospect/enums/retrospect.enum';
import { User } from 'src/modules/user/entity/user.entity';

@Entity('retrospect_settings')
export class RetrospectSetting {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, (user) => user.retrospect_settings, { onDelete: 'CASCADE' })
  user: User;

  @Column({ type: 'enum', enum: RetrospectConcept })
  concept: RetrospectConcept; // 감정, 사건, 성찰

  @Column({ type: 'enum', enum: RetrospectVolume })
  volume: RetrospectVolume; // 4, 5, 6개 질문 설정
}
