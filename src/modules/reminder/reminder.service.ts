import { SendEmailCommand, SESClient } from "@aws-sdk/client-ses";
import { Injectable } from "@nestjs/common";
import { AWSClient } from "../aws/aws.client";
import { ConfigService } from "@nestjs/config";
import { getReminderEmailTemplate } from "./library/email-template";

@Injectable()
export class ReminderService {
  private sesClient: SESClient;
  private readonly fromEmail: string;
  private readonly frontendUrl: string;

  constructor(
    private readonly awsClient: AWSClient,
    private readonly configService: ConfigService,
  ) {
    this.sesClient = this.awsClient.getSESClient();
    this.fromEmail = this.configService.get<string>("AWS_SES_FROM_EMAIL");
    this.frontendUrl = this.configService.get<string>("FRONTEND_URL");
  }

  // SES 도메인 증명 필요
  async sendReminderEmail(to: string, name: string) {
    const emailContent = getReminderEmailTemplate(name, this.frontendUrl);

    const command = new SendEmailCommand({
      Source: this.fromEmail,
      Destination: { ToAddresses: [to] },
      Message: {
        Subject: { Data: "회고를 작성하세요!" },
        Body: { Html: { Data: emailContent } },
      },
    });

    try {
      await this.sesClient.send(command);
      console.log(`이메일 전송 완료: ${to}`);
    } catch (error) {
      console.error(`이메일 전송 실패: ${to}`, error);
    }
  }
}