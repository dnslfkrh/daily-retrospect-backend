import { IsArray, IsString, ValidateNested, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class ImageItem {
  @ApiProperty({
    description: 'S3에 저장된 이미지 키(경로)',
    example: 'users/user123/images/photo1.jpg',
    required: true
  })
  @IsString()
  s3_key: string;

  @ApiProperty({
    description: '이미지에 대한 설명(선택사항)',
    example: '가족 여행 사진',
    required: false
  })
  @IsString()
  @IsOptional()
  description?: string;
}

export class ApplyImagesDto {
  @ApiProperty({
    description: '기존에 저장된 이미지 키 목록(유지할 이미지)',
    type: [String],
    example: ['users/user123/images/old-photo1.jpg', 'users/user123/images/old-photo2.jpg'],
    required: false
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  existingKeys?: string[] = [];

  @ApiProperty({
    description: '새로 추가할 이미지 목록',
    type: [ImageItem],
    required: true
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ImageItem)
  newImages: ImageItem[];
}