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
import * as admin from 'firebase-admin';

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

  async delete(id: string) {
    await this.notificationRepository.delete({
      id: Number(id),
    });
  }

  async registerNotification(
    type: string,
    label: string,
    image: Buffer,
    fcmTokens: string[],
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

      for (const fcmToken of fcmTokens) {
        if (!fcmToken) continue;
        this.senPush(notification, fcmToken);
      }

      this.notificationsGateway.sendNotification({
        type: notification.type,
        message: notification.message,
      });
    } catch (error) {
      console.error('Error saving notification:', error);
      throw new Error('Notification save failed');
    }
  }

  async senPush(notification: Notification, fcmToken: string) {
    try {
      await admin
        .messaging()
        .send({
          notification: {
            title: notification.type,
            body: notification.message,
            imageUrl: notification.imageUrl,
          },
          token: fcmToken,
          data: {},
          android: {
            priority: notification.type == 'Verified' ? 'normal' : 'high',
            notification: { sound: 'default', channelId: 'default' },
          },
          apns: {
            headers: {
              'apns-priority': notification.type == 'Verified' ? '5' : '10',
            },
            payload: { aps: { contentAvailable: true, sound: 'default' } },
          },
        })
        .catch((error) => {
          console.error('Error sending push notification:', error);
        });
    } catch (error) {
      console.error('Error sending push notification:', error);
      throw new Error('Push notification failed');
    }
  }
}
