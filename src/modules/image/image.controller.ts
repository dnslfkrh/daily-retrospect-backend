import { Body, Controller, Get, Post, UploadedFiles, UseInterceptors } from "@nestjs/common";
import { ImageService } from "./image.service";
import { User } from "src/common/decorators/user.decorator";
import { UserSub } from "src/common/types/user-payload.type";
import { FilesInterceptor } from "@nestjs/platform-express";

@Controller("image")
export class ImageController {
  constructor(
    private readonly imageService: ImageService
  ) { }

  @Get("today")
  async getTodayImage(@User() user: UserSub) {
    return await this.imageService.getImagesByDate(user, new Date());
  }

  @Post("apply")
  @UseInterceptors(FilesInterceptor("images", 3))
  async applyImages(
    @User() user: UserSub,
    @UploadedFiles() images: Express.Multer.File[],
    @Body() body: { descriptions: string | string[]; existingImages: string }
  ) {
    const descriptions = typeof body.descriptions === "string" ? [body.descriptions] : body.descriptions;
    const existingKeys: string[] = JSON.parse(body.existingImages ?? "[]");

    return await this.imageService.applyImages({
      user,
      existingKeys,
      newImages: images,
      newDescriptions: descriptions,
    });
  }
}