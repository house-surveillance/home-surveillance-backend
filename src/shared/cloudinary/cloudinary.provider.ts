import { v2 as cloudinary } from 'cloudinary';

export const CloudinaryProvider = {
  provide: 'CLOUDINARY',
  useFactory: () => {
    return cloudinary.config({
      cloud_name: process.env.CLOUDINARY_NAME || 'dzhj9r7lf',
      api_key: process.env.CLOUDINARY_API_KEY || '564796717489281',
      api_secret:
        process.env.CLOUDINARY_API_SECRET || 'syehO9R2usQ79xzfaIFHe5WNtUg',
    });
  },
};
