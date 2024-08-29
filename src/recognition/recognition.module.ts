import { Module } from '@nestjs/common';

import { RecognitionService } from './application/services/recognition.service';
import { RecognitionController } from './api/recognition.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RegisteredFace } from './domain/entities/registeredFace.entity';
import { CloudinaryService } from 'src/shared/cloudinary/cloudinary.service';
import { NotificationService } from 'src/notifications/application/services/notification.service';
import { NotificationsModule } from 'src/notifications/notifications.module';
import { IamModule } from 'src/iam/iam.module';
import { UserService } from 'src/iam/application/services/user.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([RegisteredFace]),
    NotificationsModule,
    IamModule,
  ],
  controllers: [RecognitionController],
  providers: [RecognitionService, CloudinaryService, UserService],
})
export class RecognitionModule {}
