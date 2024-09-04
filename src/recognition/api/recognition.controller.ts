import {
  Controller,
  Post,
  Body,
  UploadedFile,
  UseInterceptors,
  Get,
  UploadedFiles,
  BadRequestException,
} from '@nestjs/common';
import { RecognitionService } from '../application/services/recognition.service';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { Express } from 'express';

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
    @Body('name') name: string,
    @UploadedFiles() files: Express.Multer.File[],
    @Body('userID') userID: number,
  ) {
    if (!files || files.length !== 4) {
      throw new BadRequestException('Se necesitan exactamente 4 imágenes.');
    }

    const frontal = files[0];
    const rightProfile = files[1];
    const leftProfile = files[2];
    const fromAbove = files[3];

    return this.recognitionService.saveFace(
      name,
      //file?.buffer ?? null,
      frontal?.buffer ?? null,
      rightProfile?.buffer ?? null,
      leftProfile?.buffer ?? null,
      fromAbove?.buffer ?? null,
      userID,
    );
  }

  // @Post('add-face-to-model')
  // @UseInterceptors(FileInterceptor('file'))
  // async addFace(
  //   @Body('name') name: string,
  //   @Body('userId') userId: number,
  //   @UploadedFile() file: Express.Multer.File,
  // ) {
  //   return this.recognitionService.addFaceToModel(userId, name, file?.buffer);
  // }

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
