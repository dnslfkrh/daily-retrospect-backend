import { Injectable, InternalServerErrorException } from "@nestjs/common";
import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { AWSClient } from "src/common/aws/aws.client";
import { UserSub } from "src/common/types/user-payload.type";
import { UserService } from "../user/user.service";
import * as moment from "moment-timezone";
import { ImageRepository } from "./repository/image.repository";
import { Readable } from "stream";

@Injectable()
export class ImageService {
  private s3Client: S3Client;
  private bucketName: string;

  constructor(
    private readonly userService: UserService,
    private readonly imageRepository: ImageRepository,
    private readonly awsClient: AWSClient,
  ) {
    this.s3Client = this.awsClient.getS3Client();
    this.bucketName = process.env.AWS_S3_BUCKET_NAME;
  }

  async getTodayImage(user: UserSub) {
    const today = moment().format('YYYY-MM-DD');
    const userId = await this.userService.findByCognitoId(user.sub);
    const dailyImages = await this.imageRepository.findImagesByUserAndDate(userId, today);

    if (!dailyImages.length) {
      return [];
    }

    const images = await Promise.all(
      dailyImages.map(async (dailyImage) => {
        try {
          const getObjectCommand = new GetObjectCommand({
            Bucket: this.bucketName,
            Key: dailyImage.s3_key,
          });

          const response = await this.s3Client.send(getObjectCommand);

          if (!response.Body) return null;

          const chunks = [];
          const stream = response.Body as Readable;

          for await (const chunk of stream) {
            chunks.push(chunk);
          }

          const imageBuffer = Buffer.concat(chunks);
          const base64Image = imageBuffer.toString('base64');

          return {
            id: dailyImage.id,
            contentType: response.ContentType || 'image/jpeg',
            data: base64Image,
            description: dailyImage.description,
          };
        } catch (error) {
          console.error(`Failed to fetch image from S3 (key: ${dailyImage.s3_key})`, error);
          return null;
        }
      })
    );

    return images.filter((img) => img !== null);
  }
}
