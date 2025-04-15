import { Injectable } from "@nestjs/common";
import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { AWSClient } from "src/common/aws/aws.client";
import { UserSub } from "src/common/types/user-payload.type";
import { UserService } from "../user/user.service";
import * as moment from "moment-timezone";
import { ImageRepository } from "./repository/image.repository";
import { Response } from "express";
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

  async getTodayImage(user: UserSub, res: Response) {
    const today = moment().format('YYYY-MM-DD');
    const userId = await this.userService.findByCognitoId(user.sub);
    const dailyImages = await this.imageRepository.findImagesByUserAndDate(userId, today);

    console.log("dailyImages", dailyImages);

    if (!dailyImages.length) {
      return null;
    }

    const images = [];

    for (const dailyImage of dailyImages) {
      try {
        const getObjectCommand = new GetObjectCommand({
          Bucket: this.bucketName,
          Key: dailyImage.s3_key,
        });

        const response = await this.s3Client.send(getObjectCommand);

        if (!response.Body) {
          console.warn(`S3에서 키: ${dailyImage.s3_key}에 해당하는 이미지를 찾을 수 없습니다.`);
          continue;
        }

        // S3 스트림에서 데이터를 버퍼로 읽기
        const chunks = [];
        const stream = response.Body as Readable;

        for await (const chunk of stream) {
          chunks.push(chunk);
        }

        const imageBuffer = Buffer.concat(chunks);
        const base64Image = imageBuffer.toString('base64');

        images.push({
          id: dailyImage.id,
          contentType: response.ContentType || 'image/jpeg',
          data: base64Image,
          description: dailyImage.description
        });
      } catch (error) {
        console.error(`S3에서 키: ${dailyImage.s3_key} 이미지 가져오기 실패:`, error);
      }
    }

    res.status(200).json(images);
  }
}