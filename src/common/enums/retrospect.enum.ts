export enum RetrospectConcept {
  EMOTION = 'emotion', // 감정 중심
  EVENT = 'event', // 사건 중심
  REFLECTION = 'reflection', // 성찰 중심
}

export enum RetrospectVolume {
  LIGHT = 'light', // 4개 (2:1:1)
  STANDARD = 'standard', // 5개 (3:1:1)
  DEEP = 'deep', // 6개 (4:1:1)
}

export enum AnswerType {
  TEXT = 'text',
  SINGLE_CHOICE = 'single_choice',
  MULTI_CHOICE = 'multi_choice',
}
