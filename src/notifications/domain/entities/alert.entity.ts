import { User } from 'src/iam/domain/entities/user.entity';
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';

@Entity('alerts')
export class Alert {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  type: string;

  @Column()
  description: string;

  @Column()
  image: string;

  // @ManyToOne(() => User, (user) => user.alerts, { nullable: true })
  // user: User;

  @Column()
  timestamp: Date;

  @Column()
  resolved: boolean;

  // @Column()
  // createdAt: Date;

  // @Column()
  // updatedAt: Date;
}
