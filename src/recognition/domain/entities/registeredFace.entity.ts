import { User } from 'src/iam/domain/entities/user.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('registered_faces')
export class RegisteredFace {
  @PrimaryGeneratedColumn()
  id: number;

  // @Column()
  // name: string;

  // @Column()
  // imageUrl: string;

  // @Column()
  // imageId: string;

  @Column('longtext')
  labeledDescriptors: string;

  @OneToOne(() => User, (user) => user.face)
  @JoinColumn()
  user: User;
}
