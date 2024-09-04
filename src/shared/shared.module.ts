import { Module } from '@nestjs/common';
import { CloudinaryProvider } from './cloudinary/cloudinary.provider';
import { CloudinaryService } from './cloudinary/cloudinary.service';
import { FaceRecognitionGateway } from './websocket/websocket.gateway';

@Module({
  providers: [CloudinaryProvider, CloudinaryService, FaceRecognitionGateway],
  exports: [CloudinaryProvider, CloudinaryService, FaceRecognitionGateway],
})
export class SharedModule {}
