export enum RetrospectConcept {
  COMMON = 'common', // 공통
  EMOTION = 'emotion', // 감정 중심
  EVENT = 'event', // 사건 중심
  REFLECTION = 'reflection', // 성찰 중심
  GOAL = 'goal', // 목표 중심
}

export enum RetrospectVolume {
  LIGHT = 'light', // 4개 (2:1:1)
  STANDARD = 'standard', // 5개 (3:1:1)
  DEEP = 'deep', // 6개 (4:1:1)
}

export enum AnswerType {
  TEXT = 'text',  // 자유 입력형 (문장)
  SINGLE_CHOICE = 'single_choice',  // 단일 선택형 (라디오 버튼, 이모티콘 등)
  MULTI_CHOICE = 'multi_choice',  // 다중 선택형 (배열, 키워드 여러 개 선택)
  SCORE = 'score'  // 점수형 (1~10점 스크롤 입력)
}

export const CONCEPT_RATIOS: Record<RetrospectVolume, [number, number, number]> = {
  [RetrospectVolume.LIGHT]: [2, 1, 1],
  [RetrospectVolume.STANDARD]: [3, 1, 1],
  [RetrospectVolume.DEEP]: [4, 1, 1],
};