import { Injectable } from "@nestjs/common";
import { UserSub } from "src/common/types/user-payload.type";
import { UserService } from "../user/user.service";
import * as moment from "moment-timezone";
import { ImageRepository } from "./repository/image.repository";
import { ApplyImageInput } from "./types/apply-images.type";
import { S3Service } from "../aws/s3.service";
import * as crypto from "crypto";

@Injectable()
export class ImageService {
  constructor(
    private readonly userService: UserService,
    private readonly imageRepository: ImageRepository,
    private readonly s3Service: S3Service,
  ) { }

  async getImagesByDate(user: UserSub, targetDate: Date) {
    const formattedDate = moment(targetDate).format('YYYY-MM-DD');
    const userId = await this.userService.findByCognitoId(user.sub);
    const dailyImages = await this.imageRepository.findImagesByUserAndDate(userId, formattedDate);

    if (!dailyImages.length) {
      return [];
    }

    const images = await Promise.all(
      dailyImages.map(async (dailyImage) => {
        try {
          const imageBuffer = await this.s3Service.getObject(dailyImage.s3_key);

          if (!imageBuffer) {
            return null;
          }

          const base64Image = imageBuffer.toString('base64');
          return {
            id: dailyImage.id,
            contentType: 'image/jpeg',
            data: base64Image,
            description: dailyImage.description,
            s3_key: dailyImage.s3_key,
          };
        } catch (error) {
          console.error(`Failed to fetch image from S3 (key: ${dailyImage.s3_key})`, error);
          return null;
        }
      })
    );

    return images.filter((img) => img !== null);
  }

  async applyImages(input: ApplyImageInput) {
    const { user, existingKeys, newImages, newDescriptions } = input;

    const userId = await this.userService.findByCognitoId(user.sub);
    const today = moment().format("YYYY-MM-DD");

    const existingImages = await this.imageRepository.findImagesByUserAndDate(userId, today);
    const toDelete = existingImages.filter((img) => !existingKeys.includes(img.s3_key));

    const deletePromises = toDelete.map(async (img) => {
      await this.imageRepository.deleteImageById(img.id);
      await this.s3Service.deleteObject(img.s3_key);
    });

    const uploadPromises = newImages.map(async (file, i) => {
      const description = newDescriptions[i];
      const timestamp = moment().format("YYYYMMDD_HHmmss");
      const randomString = crypto.randomBytes(8).toString("hex");
      const s3_key = `user-${userId}/${today}/${timestamp}_${randomString}_${file.originalname}`;

      const s3Promise = this.s3Service.uploadObject({
        key: s3_key,
        body: file.buffer,
        contentType: file.mimetype,
      });

      const dbPromise = this.imageRepository.saveImage({
        userId,
        s3_key,
        description: description || "",
        date: today,
      });

      return Promise.all([s3Promise, dbPromise]);
    });

    return await Promise.all([...deletePromises, ...uploadPromises.flat()]);
  }

  async getImagesForGallery(user: UserSub, page: number, imagesCount: number) {
    const userId = await this.userService.findByCognitoId(user.sub);
    const offset = (page - 1) * imagesCount;
    const imagesKeys = await this.imageRepository.findRecentImagesByCount(userId, offset, imagesCount);

    const images = await Promise.all(
      imagesKeys.map(async (dailyImage) => {
        try {
          const imageBuffer = await this.s3Service.getObject(dailyImage.s3_key);

          if (!imageBuffer) {
            return null;
          }

          const base64Image = imageBuffer.toString('base64');
          return {
            id: dailyImage.id,
            contentType: 'image/jpeg',
            data: base64Image,
            description: dailyImage.description,
            s3_key: dailyImage.s3_key,
            date: dailyImage.date,
          };
        } catch (error) {
          console.error(`Failed to fetch image from S3 (key: ${dailyImage.s3_key})`, error);
          return null;
        }
      })
    );

    return images.filter((img) => img !== null);
  }

  async getNumberOfImages(user: UserSub) {
    const userId = await this.userService.findByCognitoId(user.sub);
    return await this.imageRepository.findNumberOfImagesByUserId(userId);
  }
}
