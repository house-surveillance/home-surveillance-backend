import { User } from 'src/iam/domain/entities/user.entity';
import {
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('registered_faces')
export class RegisteredFace {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('longtext')
  labeledDescriptors: string;

  @OneToOne(() => User, (user) => user.face, { onDelete: 'CASCADE' })
  @JoinColumn()
  user: User;
}
