import {
  Controller,
  Post,
  Body,
  UseInterceptors,
  Get,
  UploadedFiles,
  BadRequestException,
} from '@nestjs/common';
import { RecognitionService } from '../application/services/recognition.service';
import { FilesInterceptor } from '@nestjs/platform-express';
import { RegisterFaceDto } from '../application/dtos/register-face.dto';

@Controller('recognition')
export class RecognitionController {
  constructor(private readonly recognitionService: RecognitionService) {}

  @Get('/')
  async getAll() {
    return this.recognitionService.getAll();
  }

  @Post('register-face')
  @UseInterceptors(FilesInterceptor('files', 4))
  async registerFace(
    @Body() registerFaceDto: RegisterFaceDto,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    if (!files || files.length !== 4) {
      throw new BadRequestException('Exactly 4 images are required.');
    }

    const frontal = files[0];
    const rightProfile = files[1];
    const leftProfile = files[2];
    const fromAbove = files[3];

    const imagesBuffer: {
      [key: string]: (Buffer | null) | null;
    } = {
      frontal: frontal.buffer ?? null,
      rightProfile: rightProfile.buffer ?? null,
      leftProfile: leftProfile.buffer ?? null,
      fromAbove: fromAbove?.buffer ?? null,
    };

    return this.recognitionService.registerFace(registerFaceDto, imagesBuffer);
  }

  @Post('process-ip-camera')
  async processIPCameraStream(@Body('streamURL') streamURL: string) {
    //await this.recognitionService.processAndRecordStream(streamURL);
    await this.recognitionService.processWebcamStream();
    //await this.recognitionService.processVideo(streamURL);
    //await this.recognitionService.processWebcamVideo();
  }
}
