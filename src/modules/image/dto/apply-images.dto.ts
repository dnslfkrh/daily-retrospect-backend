import { IsArray, IsString, ValidateNested, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

class ImageItem {
  @IsString()
  s3_key: string;

  @IsString()
  @IsOptional()
  description?: string;
}

export class ApplyImagesDto {
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  existingKeys?: string[] = [];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ImageItem)
  newImages: ImageItem[];
}
