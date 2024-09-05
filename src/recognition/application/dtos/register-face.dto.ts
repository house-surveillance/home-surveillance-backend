import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsString,
  min,
} from 'class-validator';

export class RegisterFaceDto {
  @IsString()
  name: string;

  @IsString()
  userID: string;

//   @IsArray()
//   @ArrayMinSize(4, { message: 'Exactly 4 images are required.' })
//   @ArrayMaxSize(4, { message: 'Exactly 4 images are required.' })
//   files: Express.Multer.File[];
}
