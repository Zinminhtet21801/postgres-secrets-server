import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity()
export class Secrets {
  @PrimaryGeneratedColumn({
    type: "int",
  })
  id: number;

  @Column()
  title: string;

  @Column()
  body: string;
}
