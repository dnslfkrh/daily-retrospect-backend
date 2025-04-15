import { Controller, Get, Query, Res } from "@nestjs/common";
import { ImageService } from "./image.service";
import { User } from "src/common/decorators/user.decorator";
import { UserSub } from "src/common/types/user-payload.type";
import { Response } from "express";

@Controller("image")
export class ImageController {
  constructor(
    private readonly imageService: ImageService
  ) { }

  @Get("today")
  async getTodayImage(@User() user: UserSub, @Res() res: Response) {
    return await this.imageService.getTodayImage(user, res);
  }
}