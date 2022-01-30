import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity()
export class Secrets {
  @PrimaryGeneratedColumn("rowid")
  id: number;

  @Column()
  title: string;

  @Column()
  body: string;
}
