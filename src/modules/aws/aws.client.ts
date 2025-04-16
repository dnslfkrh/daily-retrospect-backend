import { SESClient } from "@aws-sdk/client-ses";
import { S3Client } from "@aws-sdk/client-s3";
import { Injectable } from "@nestjs/common";

@Injectable()
export class AWSClient {
  private sesClient: SESClient;
  private s3Client: S3Client;

  constructor() {
    const credentials = {
      accessKeyId: process.env.AWS_SES_ACCESS_KEY,
      secretAccessKey: process.env.AWS_SES_SECRET_KEY,
    };

    this.sesClient = new SESClient({
      region: process.env.AWS_REGION,
      credentials,
    });

    this.s3Client = new S3Client({
      region: process.env.AWS_REGION,
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
