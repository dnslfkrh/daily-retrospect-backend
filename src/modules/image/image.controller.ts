import { Body, Controller, Get, Post, Query, UploadedFiles, UseInterceptors } from "@nestjs/common";
import { ImageService } from "./image.service";
import { User } from "src/common/decorators/user.decorator";
import { UserSub } from "src/common/types/user-payload.type";
import { FilesInterceptor } from "@nestjs/platform-express";
import { ApplyImagesDto } from "./dto/apply-images.dto";
import { ApiBearerAuth, ApiBody, ApiOperation, ApiQuery, ApiResponse, ApiTags } from "@nestjs/swagger";

@ApiTags('이미지')
@ApiBearerAuth()
@Controller("image")
export class ImageController {
  constructor(
    private readonly imageService: ImageService
  ) { }

  @ApiOperation({ summary: '오늘의 이미지 조회' })
  @ApiResponse({ status: 200, description: '오늘 날짜에 해당하는 이미지 목록을 반환합니다' })
  @Get("today")
  async getTodayImage(@User() user: UserSub) {
    return await this.imageService.getImagesByDate(user, new Date());
  }

  @ApiOperation({ summary: '이미지 업로드용 서명된 URL 발급' })
  @ApiResponse({ status: 200, description: 'S3에 이미지를 업로드하기 위한 서명된 URL을 반환합니다' })
  @Get("apply/signed-url")
  async getSignedUrl(@User() user: UserSub) {
    return await this.imageService.getUploadSignedUrl(user);
  }

  @ApiOperation({ summary: '이미지 적용하기' })
  @ApiBody({ type: ApplyImagesDto })
  @ApiResponse({ status: 200, description: '이미지가 성공적으로 적용되었습니다' })
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

  @ApiOperation({ summary: '갤러리용 이미지 목록 조회' })
  @ApiQuery({ name: 'page', description: '페이지 번호', required: true, type: 'number' })
  @ApiQuery({ name: 'imagesCount', description: '페이지당 이미지 수', required: false, type: 'number', example: 10 })
  @ApiResponse({ status: 200, description: '페이지네이션된 이미지 목록을 반환합니다' })
  @Get("gallery")
  async getImagesForGallery(
    @User() user: UserSub,
    @Query("page") page: number,
    @Query("imagesCount") imagesCount: number = 10
  ) {
    return await this.imageService.getImagesForGallery(user, page, imagesCount);
  }

  @ApiOperation({ summary: '전체 이미지 개수 조회' })
  @ApiResponse({ status: 200, description: '사용자가 보유한 총 이미지 개수를 반환합니다' })
  @Get("numbers")
  async getNumberOfImages(@User() user: UserSub) {
    return await this.imageService.getNumberOfImages(user);
  }
}