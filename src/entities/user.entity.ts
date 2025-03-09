import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn } from "typeorm";

@Entity("users")
@Index("google_id_unique", ["google_id"], { unique: true })
@Index("email_unique", ["email"], { unique: true })
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: "varchar", length: 255, unique: true })
  email: string;

  @Column({ type: "varchar", length: 255 })
  name: string;

  @Column({ type: "varchar", length: 255, unique: true })
  google_id: string;

  @CreateDateColumn()
  created_at: Date;
}