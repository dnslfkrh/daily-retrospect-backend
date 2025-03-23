import { SendEmailCommand, SESClient } from "@aws-sdk/client-ses";
import { Injectable } from "@nestjs/common";
import { AWS_REGION, AWS_SES_ACCESS_KEY, AWS_SES_FROM_EMAIL, AWS_SES_SECRET_KEY, FRONTEND_URL } from "src/common/config/env/env";

@Injectable()
export class ReminderService {
  private sesClient: SESClient;
  private fromEmail: string;

  constructor() {
    this.sesClient = new SESClient({
      region: AWS_REGION,
      credentials: {
        accessKeyId: AWS_SES_ACCESS_KEY,
        secretAccessKey: AWS_SES_SECRET_KEY
      }
    });

    this.fromEmail = AWS_SES_FROM_EMAIL;
  }

  // SES 도메인 증명 필요
  async sendReminderEmail(to: string, name: string) {
    const emailContent = `
      <p>안녕하세요, ${name}님!</p>
      <p>2일 동안 회고를 작성하지 않으셨네요.</p>
      <p><a href=${FRONTEND_URL}>여기</a>를 클릭하여 회고를 작성해 보세요!</p>
    `;

    const command = new SendEmailCommand({
      Source: this.fromEmail,
      Destination: { ToAddresses: [to] },
      Message: {
        Subject: { Data: "잊지 말고 회고를 작성하세요!" },
        Body: { Html: { Data: emailContent } },
      },
    });

    try {
      await this.sesClient.send(command);
      console.log(`📧 이메일 전송 완료: ${to}`);
    } catch (error) {
      console.error(`❌ 이메일 전송 실패: ${to}`, error);
    }
  }
}