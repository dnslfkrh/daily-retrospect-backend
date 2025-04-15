import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { DailyImage } from "./entity/daily-image.entity";
import { ImageService } from "./image.service";
import { ImageRepository } from "./repository/image.repository";
import { ImageController } from "./image.controller";
import { AwsModule } from "src/common/aws/aws.module";
import { UserModule } from "../user/user.module";

@Module({
  imports: [
    TypeOrmModule.forFeature([DailyImage]),
    AwsModule,
    UserModule
  ],
  providers: [
    ImageService,
    ImageRepository,
  ],
  controllers: [
    ImageController
  ],
  exports: [
    ImageService,
    ImageRepository
  ]
})

export class ImageModule { }