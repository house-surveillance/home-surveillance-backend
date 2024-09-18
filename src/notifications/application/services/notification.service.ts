import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { tmpdir } from 'os';
import { join } from 'path';
import { Notification } from 'src/notifications/domain/entities/notification.entity';
import { NotificationsGateway } from 'src/notifications/infraestructure/notificationGateWay';
import { CloudinaryService } from 'src/shared/cloudinary/cloudinary.service';
import { generateUUID } from 'src/shared/utils/generators.util';
import { Repository } from 'typeorm';
import { promises as fs } from 'fs';

@Injectable()
export class NotificationService {
  constructor(
    @InjectRepository(Notification)
    private readonly notificationRepository: Repository<Notification>,
    private readonly notificationsGateway: NotificationsGateway,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  async getAll() {
    return this.notificationRepository.find({
      order: {
        timestamp: 'DESC',
      },
    });
  }

  async create(notification: Notification) {
    this.notificationRepository.save(notification);
    this.notificationsGateway.sendNotification({
      type: notification.type,
      message: notification.message,
    });
  }

  async registerNotification(
    type: string,
    label: string,
    image: Buffer,
  ): Promise<void> {
    let imageUrl = '';
    let logoID = '';

    if (image) {
      const tempFilePath = join(tmpdir(), 'notification.jpg');
      logoID = generateUUID();

      try {
        await fs.writeFile(tempFilePath, image);
        imageUrl = await this.cloudinaryService.uploadFile({
          tempFilePath,
          logoID,
        });
      } catch (error) {
        console.error('Error uploading file:', error);
        throw new Error('File upload failed');
      } finally {
        await fs
          .unlink(tempFilePath)
          .catch((err) => console.error('Error deleting temp file:', err));
      }
    }

    try {
      const notification = await this.notificationRepository.save({
        type: type,
        imageId: logoID,
        imageUrl: imageUrl,
        message:
          type === 'Verified'
            ? `A face was detected on the camera stream ${label}`
            : 'An unknown face was detected on the camera stream',
        timestamp: new Date(),
      });
      this.notificationsGateway.sendNotification({
        type: notification.type,
        message: notification.message,
      });
    } catch (error) {
      console.error('Error saving notification:', error);
      throw new Error('Notification save failed');
    }
  }
}
