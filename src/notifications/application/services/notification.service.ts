import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Notification } from 'src/notifications/domain/entities/notification.entity';
import { Repository } from 'typeorm';

@Injectable()
export class NotificationService {
  constructor(
    @InjectRepository(Notification)
    private readonly notificationRepository: Repository<Notification>,
  ) {}

  async getAll() {
    return this.notificationRepository.find({
      order: {
        timestamp: 'DESC',
      },
    });
  }

  async create(notification: Notification) {
    return this.notificationRepository.save(notification);
  }
}
