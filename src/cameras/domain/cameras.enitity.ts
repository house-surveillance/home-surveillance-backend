import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { User } from 'src/iam/domain/entities/user.entity';

@Entity('cameras')
export class Camera {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  location: string;

  @Column()
  ipAddress: string;

  @Column()
  status: string;

  // @ManyToOne(() => User, (user) => user.cameras)
  // user: User;

  // @Column()
  // createdAt: Date;

  // @Column()
  // updatedAt: Date;
}
