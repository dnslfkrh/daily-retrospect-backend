export function getScoreFeedback(score: number): string {
  if (score >= 9) {
    return "완벽에 가깝네요! 꾸준히 유지해 보세요.";
  }
  if (score >= 7) {
    return "좋아요! 조금 더 집중하면 더 발전할 수 있어요.";
  }
  if (score >= 5) {
    return "나쁘지 않아요. 하지만 더 노력하면 좋은 결과가 있을 거예요!";
  }
  if (score >= 3) {
    return "조금 더 신경 써보는 건 어떨까요? 작은 습관이 큰 변화를 만듭니다.";
  }
  return "너무 어려운 목표를 설정하진 않았나요? 아니면 무슨 일이 있나요?";
}
