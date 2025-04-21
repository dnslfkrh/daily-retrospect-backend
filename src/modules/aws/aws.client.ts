import { SESClient } from "@aws-sdk/client-ses";
import { S3Client } from "@aws-sdk/client-s3";
import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class AWSClient {
  private sesClient: SESClient;
  private s3Client: S3Client;
  private readonly awsRegion: string;

  constructor(
    private readonly configService: ConfigService,
  ) {
    const credentials = {
      accessKeyId: this.configService.get<string>("AWS_SES_ACCESS_KEY"),
      secretAccessKey: this.configService.get<string>("AWS_SES_SECRET_KEY")
    };

    this.awsRegion = this.configService.get<string>("AWS_REGION");

    this.sesClient = new SESClient({
      region: this.awsRegion,
      credentials,
    });

    this.s3Client = new S3Client({
      region: this.awsRegion,
      credentials,
    });
  }

  getSESClient(): SESClient {
    return this.sesClient;
  }

  getS3Client(): S3Client {
    return this.s3Client;
  }
}
