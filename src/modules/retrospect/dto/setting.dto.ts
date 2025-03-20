import { IsEnum } from "class-validator";
import { RetrospectConcept, RetrospectVolume } from "src/common/enums/retrospect.enum";

export class RetrospectSettingDto {
  @IsEnum(RetrospectConcept)
  concept: RetrospectConcept;

  @IsEnum(RetrospectVolume)
  volume: RetrospectVolume;
}
