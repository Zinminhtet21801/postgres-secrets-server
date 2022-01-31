import { Entity, Column, PrimaryColumn } from "typeorm";

@Entity()
export class Secrets {
  @PrimaryColumn()
  id: string;

  @Column()
  title: string;

  @Column()
  body: string;

  @Column({
    type: "date",
  })
  createdAt;
}
