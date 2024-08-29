import {
  Controller,
  Post,
  Body,
  UploadedFile,
  UseInterceptors,
  Get,
} from '@nestjs/common';
import { RecognitionService } from '../application/services/recognition.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { Express } from 'express';

@Controller('recognition')
export class RecognitionController {
  constructor(private readonly recognitionService: RecognitionService) {}

  @Get('/')
  async getAll() {
    return this.recognitionService.getAll();
  }

  @Post('register-face')
  @UseInterceptors(FileInterceptor('file'))
  async registerFace(
    @Body('name') name: string,
    @UploadedFile() file: Express.Multer.File,
    @Body('userID') userID: number,
  ) {
    return this.recognitionService.saveFace(name, file?.buffer ?? null, userID);
  }

  @Post('add-face-to-model')
  @UseInterceptors(FileInterceptor('file'))
  async addFace(
    @Body('name') name: string,
    @Body('userId') userId: number,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.recognitionService.addFaceToModel(userId, name, file?.buffer);
  }

  // @Post('recognize-face')
  // @UseInterceptors(FileInterceptor('file'))
  // async recognizeFace(@UploadedFile() file: Express.Multer.File) {
  //   const prediction = await this.recognitionService.recognizeFace(file.buffer);
  //   return prediction
  //     ? { label: prediction.label, distance: prediction.distance }
  //     : { message: 'No face recognized' };
  // }

  @Post('process-ip-camera')
  async processIPCameraStream(@Body('streamURL') streamURL: string) {
    await this.recognitionService.processAndRecordStream(streamURL);
  }
}
