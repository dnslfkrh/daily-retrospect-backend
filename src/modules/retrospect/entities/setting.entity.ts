import { Column, Entity, PrimaryGeneratedColumn, OneToMany, ManyToOne } from 'typeorm';
import { User } from 'src/modules/user/entity/user.entity';
import { RetrospectConceptEnum } from '../enums/retrospect-concept.enum';
import { RetrospectVolumeEnum } from '../enums/retrospect-volume.enum';

@Entity('retrospect_settings')
export class RetrospectSetting {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, (user) => user.retrospect_settings, { onDelete: 'CASCADE' })
  user: User;

  @Column({ type: 'enum', enum: RetrospectConceptEnum })
  concept: RetrospectConceptEnum;

  @Column({ type: 'enum', enum: RetrospectVolumeEnum })
  volume: RetrospectVolumeEnum;
}
