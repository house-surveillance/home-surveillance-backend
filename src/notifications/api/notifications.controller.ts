import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { NotificationService } from '../application/services/notification.service';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationService: NotificationService) {}

  @Get('/')
  async getAll() {
    return this.notificationService.getAll();
  }

  @Post('/')
  @UseInterceptors(FileInterceptor('file'))
  async create(
    @UploadedFile() file: Express.Multer.File,
    @Body('type') type: string,
    @Body('label') label: string,
  ) {
    const buffer = file?.buffer ?? null;

    if (!buffer) {
      throw new BadRequestException('Image is required.');
    }

    return this.notificationService.registerNotification(type, label, buffer);
  }
}
