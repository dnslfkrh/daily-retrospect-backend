import { Body, Controller, Get, Param, Post, Put, Query } from "@nestjs/common";
import { RetrospectService } from "./retrospect.service";
import { User } from "src/common/decorators/user.decorator";
import { UserSub } from "src/common/types/user-payload.type";
import { RetrospectSettingDto } from "./dtos/setting.dto";
import { RetrospectAnswerDto } from "./dtos/answer.dto";
import * as moment from 'moment';

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
    const result =  await this.retrospectService.setSetting(user, setting);
    console.log("Setting result:", result);
    return result;
  }

  @Get('session')
  async getSession(@User() user: UserSub) {
    return await this.retrospectService.findOrCreateSession(user);
  }

  @Get('session/today')
  async todaySessionExistCheck(@User() user: UserSub) {
    return await this.retrospectService.todaySessionExistCheck(user);
  }

  @Post('session/:sessionId/answer')
  async saveAnswer(
    @User() user: UserSub,
    @Param('sessionId') sessionId: number,
    @Body() saveAnswerDto: RetrospectAnswerDto
  ) {
    return await this.retrospectService.saveAnswer(user, sessionId, saveAnswerDto);
  }

  @Get('dates')
  async getSessionDates(@User() user: UserSub) {
    return await this.retrospectService.getSessionDates(user);
  }

  @Get('summary')
  async getSummary(
    @User() user: UserSub,
    @Query('date') date: string
  ) {
    return await this.retrospectService.getSummary(user, date);
  }

  @Get("goal-scores")
  async getGoalScores(
    @User() user: UserSub,
    @Query("period") period: string
  ) {
    return await this.retrospectService.getGoalEvaluationAnswers(user, period);
  }

  @Get("last-summary")
  async getLastSummary(@User() user: UserSub) {
    return await this.retrospectService.getLastSummary(user);
  }
}