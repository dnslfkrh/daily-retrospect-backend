import { Body, Controller, Get, Post, Query, UploadedFiles, UseInterceptors } from "@nestjs/common";
import { ImageService } from "./image.service";
import { User } from "src/common/decorators/user.decorator";
import { UserSub } from "src/common/types/user-payload.type";
import { FilesInterceptor } from "@nestjs/platform-express";
import { ApplyImagesDto } from "./dto/apply-images.dto";

@Controller("image")
export class ImageController {
  constructor(
    private readonly imageService: ImageService
  ) { }

  @Get("today")
  async getTodayImage(@User() user: UserSub) {
    return await this.imageService.getImagesByDate(user, new Date());
  }

  @Get("apply/signed-url")
  async getSignedUrl(@User() user: UserSub) {
    return await this.imageService.getUploadSignedUrl(user);
  }

  @Post("apply")
  async applyImages(
    @User() user: UserSub,
    @Body() applyImagesDto: ApplyImagesDto
  ) {
    return await this.imageService.applyImages({
      user,
      existingKeys: applyImagesDto.existingKeys,
      newImages: applyImagesDto.newImages
    });
  }

  @Get("gallery")
  async getImagesForGallery(@User() user: UserSub, @Query("page") page: number) {
    const pageNumber = page;
    const imagesCount = 10;
    return await this.imageService.getImagesForGallery(user, pageNumber, imagesCount);
  }

  @Get("numbers")
  async getNumberOfImages(@User() user: UserSub) {
    return await this.imageService.getNumberOfImages(user);
  }
}