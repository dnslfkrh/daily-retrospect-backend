import { IsEnum } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";
import { RetrospectConceptEnum } from "../enums/retrospect-concept.enum";
import { RetrospectVolumeEnum } from "../enums/retrospect-volume.enum";

export class RetrospectSettingDto {
  @ApiProperty({
    description: '회고 컨셉/유형',
    enum: RetrospectConceptEnum,
    example: RetrospectConceptEnum.COMMON,
    required: true
  })
  @IsEnum(RetrospectConceptEnum)
  concept: RetrospectConceptEnum;

  @ApiProperty({
    description: '회고 질문 볼륨(개수)',
    enum: RetrospectVolumeEnum,
    example: RetrospectVolumeEnum.STANDARD,
    required: true
  })
  @IsEnum(RetrospectVolumeEnum)
  volume: RetrospectVolumeEnum;
}
