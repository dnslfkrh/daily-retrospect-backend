import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { DailyImage } from "../entity/daily-image.entity";
import { DeleteResult, Repository, UpdateResult } from "typeorm";

@Injectable()
export class ImageRepository {
  constructor(
    @InjectRepository(DailyImage)
    private readonly imageRepository: Repository<DailyImage>
  ) { }

  async findImagesByUserAndDate(userId: number, date: string): Promise<DailyImage[]> {
    const image = await this.imageRepository.find({
      where: {
        user: { id: userId },
        date: date
      },
      order: {
        id: "ASC"
      }
    });
    return image;
  }

  async deleteImageById(id: number): Promise<DeleteResult> {
    return await this.imageRepository.delete({ id });
  }

  async saveImage(data: {
    userId: number;
    s3_key: string;
    description: string;
    date: string;
  }): Promise<DailyImage> {
    const image = this.imageRepository.create({
      user: { id: data.userId },
      s3_key: data.s3_key,
      description: data.description,
      date: data.date,
    });

    console.log("Image data to save:", image);

    return await this.imageRepository.save(image);
  }

  async updateDescription(s3_key: string, description: string): Promise<UpdateResult> {
    return await this.imageRepository.update({ s3_key }, { description });
  }

  async findRecentImagesByCount(userId: number, offset: number, imagesCount: number): Promise<DailyImage[]> {
    return await this.imageRepository.find({
      where: { user: { id: userId } },
      order: {
        date: "DESC",
        id: "DESC",
      },
      skip: offset,
      take: imagesCount
    });
  }

  async findNumberOfImagesByUserId(userId: number): Promise<Number> {
    return await this.imageRepository.count({
      where: { user: { id: userId } }
    });
  }
}
