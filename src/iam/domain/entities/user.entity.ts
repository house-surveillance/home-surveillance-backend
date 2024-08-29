import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  Entity,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Profile } from './profile.entity';

import { RegisteredFace } from 'src/recognition/domain/entities/registeredFace.entity';
import { Notification } from 'src/notifications/domain/entities/notification.entity';
import { Alert } from 'src/notifications/domain/entities/alert.entity';
import { Camera } from 'src/cameras/domain/cameras.enitity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('text')
  userName: string;

  @Column('text')
  email: string;

  @Column('text', {
    select: false,
  })
  password: string;

  @Column('simple-array')
  roles: string[];

  @OneToOne(() => Profile, (profile) => profile.user)
  profile: Profile;

  @OneToOne(() => RegisteredFace, (face) => face.user) 
  face: RegisteredFace; 

  // @OneToMany(() => Notification, (notification) => notification.user)
  // notifications: Notification[];

  // @OneToMany(() => Alert, (alert) => alert.user)
  // alerts: Alert[];

  // @OneToMany(() => Camera, (camera) => camera.user)
  // cameras: Camera[];

  @BeforeInsert()
  checkFieldsBeforeInsert() {
    this.email = this.email.toLowerCase().trim();
  }

  @BeforeUpdate()
  checkFieldsBeforeUpdate() {
    this.email = this.email.toLowerCase().trim();
  }
}
