import { Body, Controller, Get, Post, Put } from "@nestjs/common";
import { RetrospectService } from "./retrospect.service";
import { User } from "src/common/decorators/user.decorator";
import { UserSub } from "src/common/types/Payload";

@Controller('retrospect')
export class RetrospectController {
  constructor(
    private readonly retrospectService: RetrospectService
  ) { }

  @Get('today')
  async getTodayRetroSpect(@User() user: UserSub) {
    return await this.retrospectService.getTodayRetroSpect(user);
  }

  @Post('step1')
  async createStep1(@User() user: UserSub, @Body('mood') mood: string) {
    return await this.retrospectService.createStep1(user, mood);
  }

  @Put('step2')
  async addStep2(@User() user: UserSub, @Body('highlight') highlight: string) {
    console.log(highlight);
    return await this.retrospectService.addStep2(user, highlight);
  }

  @Put('step3')
  async addStep3(@User() user: UserSub, @Body('keywords') keywords: string[]) {
    return await this.retrospectService.addStep3(user, keywords);
  }

  @Put('step4')
  async addStep4(@User() user: UserSub, @Body('lesson') resolution: string) {
    return await this.retrospectService.addStep4(user, resolution);
  }

  @Put('step5')
  async addStep5(@User() user: UserSub, @Body('comment') commnet: string) {
    return await this.retrospectService.addStep5(user, commnet);
  }
}