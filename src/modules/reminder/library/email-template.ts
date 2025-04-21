export function getReminderEmailTemplate(userName: string, frontendUrl: string): string {
  return `
    <p>안녕하세요, ${userName}님!</p>
    <p>2일 동안 회고를 작성하지 않으셨네요.</p>
    <p><a href="${frontendUrl}">여기</a>를 클릭하여 회고를 작성해 보세요!</p>
  `;
}