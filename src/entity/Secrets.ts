import { Entity, Column, PrimaryColumn } from "typeorm";

@Entity()
export class Secrets {
  @PrimaryColumn()
  id: number;

  @Column()
  title: string;

  @Column()
  body: string;
}
