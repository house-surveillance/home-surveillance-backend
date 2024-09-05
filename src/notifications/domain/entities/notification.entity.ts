import { User } from 'src/iam/domain/entities/user.entity';
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';

@Entity('notifications')
export class Notification {
  @PrimaryGeneratedColumn()
  id?: number;

  @Column()
  type: string;

  @Column()
  message: string;

  @Column()
  imageUrl: string;

  @Column()
  imageId: string;

  // @ManyToOne(() => User, (user) => user.notifications)
  // user: User;

  @Column()
  timestamp: Date;

  // @Column()
  // read: boolean;

  // @Column()
  // createdAt: Date;

  // @Column()
  // updatedAt: Date;
}
