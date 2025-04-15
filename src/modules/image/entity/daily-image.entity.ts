import { User } from "src/modules/user/entity/user.entity";
import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, Unique } from "typeorm";

@Entity("daily_images")
@Unique(["user", "date"])
export class DailyImage {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, (user) => user.dailyImages, { onDelete: "CASCADE" })
  user: User;

  @Column({ type: "text" })
  s3_key: string;

  @Column({ type: "text" })
  description: string;

  @Column({ type: 'date', nullable: true })
  date: string;

  @CreateDateColumn()
  created_at: Date;
}