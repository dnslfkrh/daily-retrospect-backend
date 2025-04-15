import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { DailyImage } from "../entity/daily-image.entity";
import { Repository } from "typeorm";

@Injectable()
export class ImageRepository {
  constructor(
    @InjectRepository(DailyImage)
    private readonly imageRepository: Repository<DailyImage>
  ) { }

  async findImagesByUserAndDate(userId: number, date: string): Promise<DailyImage[]> {
    return await this.imageRepository.find({
      where: {
        user: { id: userId },
        date: date
      }
    });
  };
}
