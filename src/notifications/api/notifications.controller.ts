import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
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
    @Body('fcmTokens') fcmTokens: string,
  ) {
    const buffer = file?.buffer ?? null;

    if (!buffer) {
      throw new BadRequestException('Image is required.');
    }

    const tokensfcm = fcmTokens.split(',');

    return this.notificationService.registerNotification(
      type,
      label,
      buffer,
      tokensfcm,
    );
  }

  @Delete('/:id')
  async delete(@Param('id') id: string) {
    return this.notificationService.delete(id);
  }
}
