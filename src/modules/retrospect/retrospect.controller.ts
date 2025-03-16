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
  async addStep2(@User() user: UserSub, @Body('keywords') keywords: string[]) {
    return await this.retrospectService.addStep2(user, keywords);
  }

  @Put('step3')
  async addStep3(@User() user: UserSub, @Body('mistake') mistake: string) {
    return await this.retrospectService.addStep3(user, mistake);
  }

  @Put('step4')
  async addStep4(@User() user: UserSub, @Body('achievement') achievement: string) {
    return await this.retrospectService.addStep4(user, achievement);
  }

  @Put('step5')
  async addStep5(@User() user: UserSub, @Body('memorable_moment') memorable_moment: string) {
    return await this.retrospectService.addStep5(user, memorable_moment);
  }

  @Put('step6')
  async addStep6(@User() user: UserSub, @Body('memorable_interaction') memorable_interaction: string) {
    return await this.retrospectService.addStep6(user, memorable_interaction);
  }
}