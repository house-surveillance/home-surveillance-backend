import { Module } from '@nestjs/common';
import { NotificationsController } from './api/notifications.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Notification } from './domain/entities/notification.entity';
import { NotificationService } from './application/services/notification.service';
import { NotificationsGateway } from './infraestructure/notificationGateWay';
import { CloudinaryService } from 'src/shared/cloudinary/cloudinary.service';

@Module({
  imports: [TypeOrmModule.forFeature([Notification])],
  controllers: [NotificationsController],
  providers: [NotificationService, NotificationsGateway, CloudinaryService],
  exports: [NotificationService, NotificationsGateway],
})
export class NotificationsModule {}
