import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity()
export class Secrets {
  @PrimaryGeneratedColumn("increment")
  id: string;

  @Column()
  title: string;

  @Column()
  body: string;
}
