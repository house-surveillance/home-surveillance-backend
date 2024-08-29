import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class UpdateProfileDto {
  @IsOptional()
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
