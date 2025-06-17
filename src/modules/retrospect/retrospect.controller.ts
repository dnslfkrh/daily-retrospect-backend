import { Body, Controller, Get, Param, Post, Put, Query } from "@nestjs/common";
import { RetrospectService } from "./retrospect.service";
import { User } from "src/common/decorators/user.decorator";
import { UserSub } from "src/common/types/user-payload.type";
import { RetrospectSettingDto } from "./dtos/setting.dto";
import { RetrospectAnswerDto } from "./dtos/answer.dto";
import { ApiBearerAuth, ApiOperation, ApiParam, ApiQuery, ApiResponse, ApiTags } from "@nestjs/swagger";

@ApiTags('회고')
@ApiBearerAuth()
@Controller('retrospect')
export class RetrospectController {
  constructor(
    private readonly retrospectService: RetrospectService
  ) { }

  @ApiOperation({ summary: '사용자 회고 설정 조회' })
  @ApiResponse({ status: 200, description: '사용자의 회고 설정 정보를 반환합니다' })
  @Get('setting')
  async getSetting(@User() user: UserSub) {
    return await this.retrospectService.getSetting(user);
  }

  @ApiOperation({ summary: '사용자 회고 설정 업데이트' })
  @ApiResponse({ status: 200, description: '회고 설정이 성공적으로 업데이트되었습니다' })
  @Post('setting')
  async setSetting(@User() user: UserSub, @Body() setting: RetrospectSettingDto) {
    const result = await this.retrospectService.setSetting(user, setting);
    console.log("Setting result:", result);
    return result;
  }

  @ApiOperation({ summary: '회고 세션 조회' })
  @ApiResponse({ status: 200, description: '사용자의 회고 세션을 조회하거나 없을 경우 새로 생성합니다' })
  @Get('session')
  async getSession(@User() user: UserSub) {
    return await this.retrospectService.findOrCreateSession(user);
  }

  @ApiOperation({ summary: '오늘의 회고 세션 존재 여부 확인' })
  @ApiResponse({ status: 200, description: '오늘 회고 세션이 이미 존재하는지 여부를 반환합니다' })
  @Get('session/today')
  async todaySessionExistCheck(@User() user: UserSub) {
    return await this.retrospectService.todaySessionExistCheck(user);
  }

  @ApiOperation({ summary: '회고 답변 저장' })
  @ApiParam({ name: 'sessionId', description: '회고 세션 ID', type: 'number' })
  @ApiResponse({ status: 200, description: '회고 답변이 성공적으로 저장되었습니다' })
  @Post('session/:sessionId/answer')
  async saveAnswer(
    @User() user: UserSub,
    @Param('sessionId') sessionId: number,
    @Body() saveAnswerDto: RetrospectAnswerDto
  ) {
    return await this.retrospectService.saveAnswer(user, sessionId, saveAnswerDto);
  }

  @ApiOperation({ summary: '회고 세션 날짜 목록 조회' })
  @ApiResponse({ status: 200, description: '사용자의 회고 세션이 있는 날짜 목록을 반환합니다' })
  @Get('dates')
  async getSessionDates(@User() user: UserSub) {
    return await this.retrospectService.getSessionDates(user);
  }

  @ApiOperation({ summary: '회고 요약 조회' })
  @ApiQuery({ name: 'date', description: '조회할 날짜 (YYYY-MM-DD 형식)', required: true })
  @ApiResponse({ status: 200, description: '특정 날짜의 회고 요약 정보를 반환합니다' })
  @Get('summary')
  async getSummary(
    @User() user: UserSub,
    @Query('date') date: string
  ) {
    return await this.retrospectService.getSummary(user, date);
  }

  @ApiOperation({ summary: '목표 점수 조회' })
  @ApiQuery({ name: 'period', description: '조회 기간 (day, week, month 등)', required: true })
  @ApiResponse({ status: 200, description: '지정된 기간 동안의 목표 평가 점수를 반환합니다' })
  @Get("goal-scores")
  async getGoalScores(
    @User() user: UserSub,
    @Query("period") period: string
  ) {
    return await this.retrospectService.getGoalEvaluationAnswers(user, period);
  }

  @ApiOperation({ summary: '최근 회고 요약 조회' })
  @ApiResponse({ status: 200, description: '가장 최근의 회고 요약 정보를 반환합니다' })
  @Get("last-summary")
  async getLastSummary(@User() user: UserSub) {
    return await this.retrospectService.getLastSummary(user);
  }
}