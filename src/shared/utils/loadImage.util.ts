import { v2 as cloudinary } from 'cloudinary';

import { ConfigService } from '@nestjs/config';



// Configuration
const configService = new ConfigService();
cloudinary.config(
  'cloudinary://564796717489281:syehO9R2usQ79xzfaIFHe5WNtUg@dzhj9r7lf',
);
const FOLDER_NAME = 'HOME_SURVEILLANCE';
const UPLOAD_PRESET = 'HOME_SURVEILLANCE_UP';

interface UploadParams {
  logoID: string;
  tempFilePath: string;
  folder?: string;
}

// Upload Image using TempFilePath -> better performance
export const uploadImageBytempFilePath = async ({
  logoID,
  tempFilePath,
  folder = FOLDER_NAME,
}: UploadParams) => {
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
};
