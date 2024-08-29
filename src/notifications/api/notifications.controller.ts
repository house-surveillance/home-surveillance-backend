import { Controller, Get } from '@nestjs/common';
import { NotificationService } from '../application/services/notification.service';

@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationService: NotificationService) {}

  @Get('/')
  async getAll() {
    return this.notificationService.getAll();
  }
}
