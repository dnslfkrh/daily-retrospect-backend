import { IsEnum } from "class-validator";
import { RetrospectConceptEnum } from "../enums/retrospect-concept.enum";
import { RetrospectVolumeEnum } from "../enums/retrospect-volume.enum";

export class RetrospectSettingDto {
  @IsEnum(RetrospectConceptEnum)
  concept: RetrospectConceptEnum;

  @IsEnum(RetrospectVolumeEnum)
  volume: RetrospectVolumeEnum;
}
