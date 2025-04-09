import { RetrospectVolumeEnum } from "../enums/retrospect-volume.enum";

export const CONCEPT_RATIOS: Record<RetrospectVolumeEnum, [number, number, number]> = {
  [RetrospectVolumeEnum.LIGHT]: [2, 1, 1],
  [RetrospectVolumeEnum.STANDARD]: [3, 1, 1],
  [RetrospectVolumeEnum.DEEP]: [4, 1, 1],
};