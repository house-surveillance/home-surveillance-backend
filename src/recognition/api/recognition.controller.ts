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
      throw new BadRequestException('Se necesitan exactamente 4 imágenes.');
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

    return this.recognitionService.saveFace(
      registerFaceDto,
      //file?.buffer ?? null,
      imagesBuffer,
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
