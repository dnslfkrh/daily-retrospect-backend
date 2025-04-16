import { Injectable, InternalServerErrorException } from "@nestjs/common";
import { DeleteObjectCommand, GetObjectCommand, GetObjectCommandOutput, PutObjectCommand, S3Client } from "@aws-sdk/client-s3"; // S3Client 사용
import { Readable } from "typeorm/platform/PlatformTools";
import { AWSClient } from "./aws.client";

@Injectable()
export class S3Service {
  private readonly s3: S3Client;
  private readonly bucketName: string;

  constructor(private readonly awsClient: AWSClient) {
    this.s3 = this.awsClient.getS3Client();
    this.bucketName = process.env.AWS_S3_BUCKET_NAME;
  }

  async uploadObject(params: {
    key: string;
    body: Buffer;
    contentType: string;
  }): Promise<void> {
    try {
      await this.s3.send(new PutObjectCommand({
        Bucket: this.bucketName,
        Key: params.key,
        Body: params.body,
        ContentType: params.contentType,
        ACL: "private",
      }));
    } catch (error) {
      console.error('Error uploading object to S3:', error);
      throw new InternalServerErrorException('Error uploading object to S3');
    }
  }

  async deleteObject(key: string): Promise<void> {
    try {
      await this.s3.send(new DeleteObjectCommand({
        Bucket: this.bucketName,
        Key: key,
      }));
    } catch (error) {
      console.error('Error deleting object from S3:', error);
      throw new InternalServerErrorException('Error deleting object from S3');
    }
  }

  async getObject(key: string): Promise<Buffer | null> {
    try {
      const data: GetObjectCommandOutput = await this.s3.send(new GetObjectCommand({
        Bucket: this.bucketName,
        Key: key,
      }));

      if (data.Body) {
        const chunks: Buffer[] = [];
        const stream = data.Body as Readable;

        for await (const chunk of stream) {
          chunks.push(chunk);
        }

        return Buffer.concat(chunks);
      }

      return null;
    } catch (error) {
      console.error('Error getting object from S3:', error);
      throw new InternalServerErrorException('Error getting object from S3');
    }
  }
}
