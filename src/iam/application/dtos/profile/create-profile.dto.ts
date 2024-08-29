import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateProfileDto {
  @IsString()
  fullName: string;

  @IsOptional()
  @IsString()
  imageUrl: string;

  @IsOptional()
  @IsString()
  imageId: string;

  @IsOptional()
  @IsString()
  status: string;
}
