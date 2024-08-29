import { Module } from '@nestjs/common';
import { CamerasController } from './api/cameras.controller';
import { CamerasService } from './application/services/cameras.service';

@Module({
  controllers: [CamerasController],
  providers: [CamerasService],
})
export class CamerasModule {}
