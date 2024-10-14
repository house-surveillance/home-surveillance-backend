import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { User } from './user.entity';

@Entity('residences')
export class Residence {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('text')
  name: string;

  @Column('text')
  address: string;

  @OneToMany(() => User, (user) => user.residence)
  residents: User[];

  //   number: number;
  //   neighborhood: string;
  //   city: string;
  //   state: string;
  //   zipCode: string;
  //   country: string;
  //   residents: string[];
  //   created_at: Date;
  //   updated_at: Date;
}
