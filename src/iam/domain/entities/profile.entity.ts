import {
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from './user.entity';

@Entity('profiles')
export class Profile {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('text')
  fullName: string;
  
  @Column()
  imageUrl: string;

  @Column()
  status: string;

  @Column()
  imageId: string;

  @OneToOne(() => User, (user) => user.profile)
  @JoinColumn()
  user: User;
}
