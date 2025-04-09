export enum RetrospectAnswerTypeEnum {
  TEXT = 'text',  // 자유 입력형 (문장)
  SINGLE_CHOICE = 'single_choice',  // 단일 선택형 (라디오 버튼, 이모티콘 등)
  MULTI_CHOICE = 'multi_choice',  // 다중 선택형 (배열, 키워드 여러 개 선택)
  SCORE = 'score'  // 점수형 (1~10점 스크롤 입력)
}