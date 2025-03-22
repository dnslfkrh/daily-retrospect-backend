import { Body, Controller, Get, Param, Post, Put } from "@nestjs/common";
import { RetrospectService } from "./retrospect.service";
import { User } from "src/common/decorators/user.decorator";
import { UserSub } from "src/common/types/Payload";
import { RetrospectSettingDto } from "./dto/setting.dto";
import { RetrospectAnswerDto } from "./dto/answer.dto";

@Controller('retrospect')
export class RetrospectController {
  constructor(
    private readonly retrospectService: RetrospectService
  ) { }

  @Get('setting')
  async getSetting(@User() user: UserSub) {
    return await this.retrospectService.getSetting(user);
  }

  @Post('setting')
  async setSetting(@User() user: UserSub, @Body() setting: RetrospectSettingDto) {
    return await this.retrospectService.setSetting(user, setting);
  }

  @Get('session')
  async getSession(@User() user: UserSub) {
    return await this.retrospectService.findOrCreateSession(user);
  }

  @Post('session/:sessionId/answer')
  async saveAnswer(
    @User() user: UserSub,
    @Param('sessionId') sessionId: number,
    @Body() saveAnswerDto: RetrospectAnswerDto
  ) {
    return await this.retrospectService.saveAnswer(user, sessionId, saveAnswerDto);
  }
}