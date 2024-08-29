import { Injectable } from '@nestjs/common';
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryResponse } from './cloudinary-response';
const FOLDER_NAME = 'HOME_SURVEILLANCE';
const UPLOAD_PRESET = 'HOME_SURVEILLANCE_UP';

interface UploadParams {
  logoID: string;
  tempFilePath: string;
  folder?: string;
}

@Injectable()
export class CloudinaryService {
  async uploadFile({
    logoID,
    tempFilePath,
    folder = FOLDER_NAME,
  }: UploadParams) {
    // Destroy old image
    cloudinary.uploader.destroy(
      `${folder ?? FOLDER_NAME}/${logoID}`,
      function (error: Error, result: any) {
        console.log('cloudinary Error destroy: ', result, error);
      },
    );
    // upaload new image
    const uploadResponse = await cloudinary.uploader.upload(tempFilePath, {
      public_id: logoID,
      folder: FOLDER_NAME,
      upload_preset: UPLOAD_PRESET,
    });
    return uploadResponse.secure_url;
  }
}
